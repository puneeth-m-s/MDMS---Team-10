import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Input, Textarea } from "../../auth/components/FormFields";
import Modal from "../../auth/components/Modal";
import type { AddZoneValues } from "../types/enterprise";

interface AddZoneModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: AddZoneValues) => void;
}

const schema = z.object({
  name: z.string().trim().min(3, "Zone name must be at least 3 characters").max(60, "Zone name is too long"),
  admin: z.string().trim().min(2, "Assigned admin is required").max(80, "Admin name is too long"),
  location: z.string().trim().min(3, "Location is required").max(120, "Location is too long"),
  pincode: z.string().trim().regex(/^\d{6}$/, "Pincode must contain exactly 6 digits"),
  description: z.string().trim().min(10, "Description must be at least 10 characters").max(300, "Description is too long"),
});

export default function AddZoneModal({ open, onClose, onSubmit }: AddZoneModalProps) {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<AddZoneValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", admin: "", location: "", pincode: "", description: "" },
  });

  const close = () => {
    reset();
    onClose();
  };

  return (
    <Modal
      open={open}
      title="Add zone"
      onClose={close}
      size="lg"
      footer={
        <>
          <button type="button" className="btn" onClick={close}>Cancel</button>
          <button type="submit" form="add-zone-form" className="btn btn-primary" disabled={isSubmitting}>Submit</button>
        </>
      }
    >
      <form
        id="add-zone-form"
        className="grid gap-4 sm:grid-cols-2"
        onSubmit={handleSubmit((values) => {
          onSubmit(values);
          reset();
        })}
      >
        <Input label="Zone name" required placeholder="North Zone" {...register("name")} error={errors.name?.message} />
        <Input label="Assigned admin" required placeholder="Administrator name" {...register("admin")} error={errors.admin?.message} />
        <Input label="Location" required placeholder="District or region" {...register("location")} error={errors.location?.message} />
        <Input label="Pincode" required inputMode="numeric" maxLength={6} placeholder="560001" {...register("pincode")} error={errors.pincode?.message} />
        <div className="sm:col-span-2">
          <Textarea label="Description" required placeholder="Describe the service area" {...register("description")} error={errors.description?.message} />
        </div>
      </form>
    </Modal>
  );
}
