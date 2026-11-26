import axios from 'axios'

/**
 * The one Axios instance for the whole project.
 * When the real backend arrives, change the URL here (or in .env) and nothing else.
 */
// const API_URL: string = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'  
const API_URL: string = import.meta.env.VITE_API_URL  

const API = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10_000,
  // JSON Server wants repeated keys for "any of": ?status=pending&status=overdue
  paramsSerializer: { indexes: null },
})

/** Every failed request arrives in the UI as an ApiError with a message you can show. */
export class ApiError extends Error {
  status: number | undefined

  constructor(message: string, status?: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

API.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error)) {
      if (!error.response) {
        return Promise.reject(
          new ApiError(`Cannot reach the server at ${API_URL}. Is "npm run server" running?`),
        )
      }
      return Promise.reject(
        new ApiError(`The server returned an error (${error.response.status}).`, error.response.status),
      )
    }
    return Promise.reject(error instanceof Error ? error : new Error('Unknown error'))
  },
)

/** Use in catch blocks: setError(getErrorMessage(err)) */
export function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Something went wrong.'
}

export default API
export { API as http }