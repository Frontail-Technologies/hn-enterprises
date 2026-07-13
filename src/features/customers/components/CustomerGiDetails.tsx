import { format, parseISO } from "date-fns";
import Link from "next/link";
import { FileTextIcon, ImageSquareIcon, LinkIcon } from "@phosphor-icons/react/dist/ssr";
import { buttonVariants } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/PageHeader";
import { SectionCard } from "@/components/shared/SectionCard";
import { customerGiDetails } from "../services/customers.service";
import type { Customer } from "../types/customer.types";
import { CustomerBreadcrumb } from "./CustomerBreadcrumb";
import { CustomerInfoLine } from "./CustomerInfoLine";

export function CustomerGiDetails({ customer }: { customer: Customer }) {
  const giDetails = customerGiDetails;
  const pipelineItems: [string, string][] = [
    ["Inlet", giDetails.inlet],
    ["Outlet", giDetails.outlet],
    ["Total GI", giDetails.totalGi],
    ["Extra GI", giDetails.extraGi],
    ["Pipe Sizes", giDetails.pipeSizes],
    ["Installation Date", formatDate(giDetails.installationDate)],
  ];

  const materialItems: [string, string][] = [
    ["Valves", giDetails.valves],
    ["Regulators", giDetails.regulators],
    ["Clamps", giDetails.clamps],
    ["Elbows", giDetails.elbows],
    ["Tees", giDetails.tees],
    ["Nipples", giDetails.nipples],
  ];

  return (
    <div>
      <CustomerBreadcrumb
        items={[
          { label: "Customers", href: "/customers" },
          { label: customer.name, href: `/customers/${customer.id}` },
          { label: "GI Details" },
        ]}
      />

      <PageHeader
        title="GI Details"
        subtitle={`${customer.name} · ${customer.bpTrNumber}`}
        actions={
          <Link
            href={`/customers/${customer.id}`}
            className={buttonVariants({ variant: "outline", size: "default" })}
          >
            Back to Customer
          </Link>
        }
      />

      <div className="space-y-4">
        <div className="grid gap-4 xl:grid-cols-2">
          <SectionCard title="GI Pipeline">
            <InfoGrid items={pipelineItems} />
          </SectionCard>
          <SectionCard title="Materials">
            <InfoGrid items={materialItems} />
          </SectionCard>
        </div>

        <SectionCard title="Photos">
          <div className="grid gap-3 md:grid-cols-3">
            {giDetails.photos.map((photo) => (
              <div key={photo} className="rounded-lg border border-border bg-muted/30 p-3">
                <ImageSquareIcon size={20} className="mb-2 text-primary" />
                <p className="text-sm font-semibold text-foreground">{photo}</p>
                <p className="text-xs text-muted-foreground">GI installation photo</p>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Related Report">
          <Link
            href={`/work-progress?customerId=${customer.id}`}
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            <FileTextIcon size={14} />
            {giDetails.relatedReport}
            <LinkIcon size={13} />
          </Link>
        </SectionCard>
      </div>
    </div>
  );
}

function InfoGrid({ items }: { items: [string, string][] }) {
  return (
    <div className="grid gap-x-8 gap-y-1 md:grid-cols-2">
      {items.map(([label, value]) => (
        <CustomerInfoLine key={label} label={label} value={value} />
      ))}
    </div>
  );
}

function formatDate(value: string) {
  if (!value) return "-";

  try {
    return format(parseISO(value), "dd MMM yyyy");
  } catch {
    return value;
  }
}
