import { BuildSpecForm } from "@/components/dashboard/BuildSpecForm";

export default function Page() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-h1 text-h1 text-primary">BuildSpec Authoring</h1>
        <p className="text-on-surface-variant mt-1.5 max-w-3xl">
          Compose a Monitoring-SaaS BuildSpec. Schema-validated against PRD
          Appendix B before dispatch — invalid configs return field-level
          errors, not silent failures.
        </p>
      </div>
      <BuildSpecForm />
    </div>
  );
}
