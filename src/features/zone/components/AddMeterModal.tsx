import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Modal from "../../auth/components/Modal";
import { Input, Select } from "../../auth/components/FormFields";
import type { AddMeterValues } from "../types/zone";

interface AddMeterModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: AddMeterValues) => void;
}

const schema = z.object({
  meterId: z.string().trim().regex(/^MTR-\d{4}$/i, "Meter ID must use MTR-0000 format"),
  ownerId: z.string().trim().regex(/^C-\d{3}$/i, "Customer ID must use C-000 format"),
  owner: z.string().trim().min(2, "Owner name is required").max(80, "Owner name is too long"),
  address: z.string().trim().min(5, "Address must be at least 5 characters").max(160, "Address is too long"),
  installedDate: z.string().min(1, "Installed date is required"),
  tariffCategory: z.enum(["Residential", "Commercial", "Industrial"]),
  initialReading: z.number().finite("Enter a valid reading").min(0, "Reading cannot be negative").max(1000000, "Reading is too large"),
});

export default function AddMeterModal({ open, onClose, onSubmit }: AddMeterModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AddMeterValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      meterId: "",
      ownerId: "",
      owner: "",
      address: "",
      installedDate: "",
      tariffCategory: "Residential",
      initialReading: 0,
    },
  });

  const submit = (values: AddMeterValues) => {
    onSubmit(values);
    reset();
  };

  const close = () => {
    reset();
    onClose();
  };

  return (
    <Modal
      open={open}
      title="Add meter"
      onClose={close}
      size="lg"
      footer={
        <>
          <button type="button" className="btn" onClick={close}>Cancel</button>
          <button type="submit" form="add-meter-form" className="btn btn-primary" disabled={isSubmitting}>
            Submit
          </button>
        </>
      }
    >
      <form id="add-meter-form" onSubmit={handleSubmit(submit)} className="grid gap-4 sm:grid-cols-2">
        <Input label="Meter ID" required placeholder="MTR-1009" {...register("meterId")} error={errors.meterId?.message} />
        <Input label="Customer ID" required placeholder="C-008" {...register("ownerId")} error={errors.ownerId?.message} />
        <Input label="Owner name" required placeholder="Customer or organization name" {...register("owner")} error={errors.owner?.message} />
        <Input label="Installed date" required type="date" {...register("installedDate")} error={errors.installedDate?.message} />
        <div className="sm:col-span-2">
          <Input label="Address" required placeholder="Full service address" {...register("address")} error={errors.address?.message} />
        </div>
        <Select
          label="Tariff category"
          required
          {...register("tariffCategory")}
          options={[
            { value: "Residential", label: "Residential" },
            { value: "Commercial", label: "Commercial" },
            { value: "Industrial", label: "Industrial" },
          ]}
          error={errors.tariffCategory?.message}
        />
        <Input
          label="Initial reading"
          required
          type="number"
          step="0.1"
          min="0"
          {...register("initialReading", { valueAsNumber: true })}
          error={errors.initialReading?.message}
          hint="kWh"
        />
      </form>
    </Modal>
  );
}
