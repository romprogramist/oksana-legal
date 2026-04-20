import { ServiceForm } from "../ServiceForm";

export default function NewServicePage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-text-primary mb-6">Новая услуга</h1>
      <ServiceForm />
    </div>
  );
}
