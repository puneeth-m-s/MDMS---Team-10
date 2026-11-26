using System.Globalization;
using System.Linq.Expressions;
using System.Reflection;
using Microsoft.EntityFrameworkCore;

namespace Mdms.Common;

/// <summary>Thrown when the URL has a filter value the API cannot understand (becomes a 400 response).</summary>
public class InvalidQueryException(string message) : Exception(message)
{
}

/// <summary>
/// Gives any table the same URL options JSON Server had:
///   ?_page=1&_limit=10   paging (total rows are sent back in the X-Total-Count header)
///   ?_sort=month&_order=desc   sorting (several fields: _sort=a,b&_order=asc,desc)
///   ?q=pune              search in every text column
///   ?status=paid         exact filter (repeat the key for "any of": status=paid&status=overdue)
///   ?dueDate_gte=2026-12-01   operators: _gte _lte _gt _lt _ne _like
/// Unknown field names are ignored, so users cannot sort or filter on anything that is not a column.
/// </summary>
public static class PagedQuery
{
    private static readonly HashSet<string> Reserved = new(StringComparer.OrdinalIgnoreCase)
        { "_page", "_limit", "_sort", "_order", "q" };

    private static readonly string[] Operators = ["gte", "lte", "gt", "lt", "ne", "like"];
    private const int MaxLimit = 1000;

    private static readonly MethodInfo ToLowerMethod = typeof(string).GetMethod(nameof(string.ToLower), Type.EmptyTypes)!;
    private static readonly MethodInfo ContainsMethod = typeof(string).GetMethod(nameof(string.Contains), [typeof(string)])!;

    public static async Task<List<T>> ToPagedListAsync<T>(this IQueryable<T> source, HttpRequest request, HttpResponse response)
        where T : class
    {
        var query = request.Query;

        // Only plain columns can be filtered or sorted (not the nested JSON objects).
        var props = typeof(T).GetProperties(BindingFlags.Public | BindingFlags.Instance)
            .Where(p => IsSimple(p.PropertyType))
            .ToDictionary(p => p.Name, StringComparer.OrdinalIgnoreCase);

        // 1. Filters
        foreach (var (key, rawValues) in query)
        {
            if (Reserved.Contains(key)) continue;
            var (name, op) = SplitKey(key, props);
            if (!props.TryGetValue(name, out var prop)) continue;

            var values = rawValues.Where(v => !string.IsNullOrEmpty(v)).Select(v => v!).ToArray();
            if (values.Length == 0) continue;
            source = source.Where(BuildFilter<T>(prop, op, values, key));
        }

        // 2. Search in every text column
        var search = query["q"].ToString().Trim();
        if (search.Length > 0)
        {
            var x = Expression.Parameter(typeof(T), "x");
            Expression? body = null;
            foreach (var p in props.Values.Where(p => p.PropertyType == typeof(string)))
            {
                var clause = ContainsText(Expression.Property(x, p), search);
                body = body is null ? clause : Expression.OrElse(body, clause);
            }
            if (body is not null) source = source.Where(Expression.Lambda<Func<T, bool>>(body, x));
        }

        // 3. Total number of matching rows (before paging)
        var total = await source.CountAsync();
        response.Headers["X-Total-Count"] = total.ToString(CultureInfo.InvariantCulture);

        // 4. Sorting (then by Id, so pages never overlap)
        var sortFields = query["_sort"].ToString().Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
        var orders = query["_order"].ToString().Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
        var isOrdered = false;
        for (var i = 0; i < sortFields.Length; i++)
        {
            var field = sortFields[i];
            var desc = field.StartsWith('-');
            if (desc) field = field[1..];
            if (i < orders.Length && orders[i].Equals("desc", StringComparison.OrdinalIgnoreCase)) desc = true;
            if (!props.TryGetValue(field, out var sortProp)) continue;

            source = AddOrder(source, sortProp, desc, isOrdered);
            isOrdered = true;
        }
        var sortedById = sortFields.Any(f => f.TrimStart('-').Equals("id", StringComparison.OrdinalIgnoreCase));
        if (!sortedById && props.TryGetValue("Id", out var idProp))
        {
            source = AddOrder(source, idProp, false, isOrdered);
        }

        // 5. Paging (without _page / _limit every row is returned, like JSON Server)
        if (query.ContainsKey("_page") || query.ContainsKey("_limit"))
        {
            var limit = Math.Clamp(ParseInt(query["_limit"].ToString(), 10), 1, MaxLimit);
            var page = Math.Max(ParseInt(query["_page"].ToString(), 1), 1);
            source = source.Skip((page - 1) * limit).Take(limit);
        }

        return await source.ToListAsync();
    }

    /* ---------------- helpers ---------------- */

    private static bool IsSimple(Type type)
    {
        var t = Nullable.GetUnderlyingType(type) ?? type;
        return t.IsPrimitive || t == typeof(string) || t == typeof(decimal) || t == typeof(DateOnly) || t == typeof(DateTime);
    }

    private static int ParseInt(string text, int fallback) => int.TryParse(text, out var n) ? n : fallback;

    private static InvalidQueryException Bad(string key) => new($"Invalid filter '{key}'.");

    // "dueDate_gte" -> ("dueDate", "gte"); a plain column name -> (name, "eq")
    private static (string Name, string Op) SplitKey(string key, Dictionary<string, PropertyInfo> props)
    {
        if (props.ContainsKey(key)) return (key, "eq");
        foreach (var op in Operators)
        {
            var suffix = "_" + op;
            if (key.EndsWith(suffix, StringComparison.OrdinalIgnoreCase)) return (key[..^suffix.Length], op);
        }
        return (key, "eq");
    }

    private static Expression ContainsText(Expression member, string text) =>
        Expression.Call(
            Expression.Call(member, ToLowerMethod),
            ContainsMethod,
            Expression.Constant(text.ToLowerInvariant()));

    private static Expression<Func<T, bool>> BuildFilter<T>(PropertyInfo prop, string op, string[] values, string key)
    {
        var x = Expression.Parameter(typeof(T), "x");
        var member = Expression.Property(x, prop);
        var isString = prop.PropertyType == typeof(string);

        Expression? body = null;
        foreach (var raw in values)
        {
            Expression clause;
            if (op == "like")
            {
                if (!isString) throw Bad(key);
                clause = ContainsText(member, raw);
            }
            else
            {
                var constant = Expression.Constant(ParseValue(raw, prop.PropertyType, key), prop.PropertyType);
                clause = op switch
                {
                    "eq" => Expression.Equal(member, constant),
                    "ne" => Expression.NotEqual(member, constant),
                    _ when isString => throw Bad(key), // ranges only make sense for numbers and dates
                    "gte" => Expression.GreaterThanOrEqual(member, constant),
                    "lte" => Expression.LessThanOrEqual(member, constant),
                    "gt" => Expression.GreaterThan(member, constant),
                    "lt" => Expression.LessThan(member, constant),
                    _ => throw Bad(key),
                };
            }
            // Several values for the same key mean "any of".
            body = body is null ? clause : Expression.OrElse(body, clause);
        }
        return Expression.Lambda<Func<T, bool>>(body!, x);
    }

    private static object ParseValue(string raw, Type type, string key)
    {
        var t = Nullable.GetUnderlyingType(type) ?? type;
        try
        {
            if (t == typeof(string)) return raw;
            if (t == typeof(DateOnly)) return DateOnly.Parse(raw, CultureInfo.InvariantCulture);
            if (t == typeof(DateTime))
                return DateTime.Parse(raw, CultureInfo.InvariantCulture, DateTimeStyles.AdjustToUniversal | DateTimeStyles.AssumeUniversal);
            if (t == typeof(bool)) return bool.Parse(raw);
            return Convert.ChangeType(raw, t, CultureInfo.InvariantCulture);
        }
        catch (Exception ex) when (ex is FormatException or OverflowException or InvalidCastException)
        {
            throw Bad(key);
        }
    }

    private static IQueryable<T> AddOrder<T>(IQueryable<T> source, PropertyInfo prop, bool descending, bool thenBy)
    {
        var x = Expression.Parameter(typeof(T), "x");
        var selector = Expression.Lambda(Expression.Property(x, prop), x);
        var method = (thenBy, descending) switch
        {
            (false, false) => "OrderBy",
            (false, true) => "OrderByDescending",
            (true, false) => "ThenBy",
            _ => "ThenByDescending",
        };
        var call = Expression.Call(typeof(Queryable), method, [typeof(T), prop.PropertyType], source.Expression, Expression.Quote(selector));
        return source.Provider.CreateQuery<T>(call);
    }
}