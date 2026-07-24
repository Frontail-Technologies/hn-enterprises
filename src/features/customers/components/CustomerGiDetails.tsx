import { format, parseISO } from "date-fns";
import Link from "next/link";
import { FileTextIcon, ImageSquareIcon, LinkIcon } from "@phosphor-icons/react/dist/ssr";
import { buttonVariants } from "@/components/ui/button";
import { KeyValueGrid, type KeyValueItem } from "@/components/shared/KeyValueGrid";
import { PageHeader } from "@/components/shared/PageHeader";
import { SectionCard } from "@/components/shared/SectionCard";
import { customerGiDetails, getCustomerDisplay } from "../services/customers.service";
import type { Customer } from "../types/customer.types";

export function CustomerGiDetails({ customer }: { customer: Customer }) {
  const giDetails = customerGiDetails;
  const display = getCustomerDisplay(customer);
  const pipelineItems: KeyValueItem[] = [
    { label: "Inlet", value: giDetails.inlet },
    { label: "Outlet", value: giDetails.outlet },
    { label: "Total GI", value: giDetails.totalGi },
    { label: "Extra GI", value: giDetails.extraGi },
    { label: "Pipe Sizes", value: giDetails.pipeSizes },
    { label: "Installation Date", value: formatDate(giDetails.installationDate) },
  ];

  const materialItems: KeyValueItem[] = [
    { label: "Valves", value: giDetails.valves },
    { label: "Regulators", value: giDetails.regulators },
    { label: "Clamps", value: giDetails.clamps },
    { label: "Elbows", value: giDetails.elbows },
    { label: "Tees", value: giDetails.tees },
    { label: "Nipples", value: giDetails.nipples },
  ];

  return (
    <div>
      <PageHeader
        title="GI Details"
        subtitle={`${display.name} - ${display.trBpNo}`}
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
            <KeyValueGrid items={pipelineItems} />
          </SectionCard>
          <SectionCard title="Materials">
            <KeyValueGrid items={materialItems} />
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

function formatDate(value: string) {
  if (!value) return "-";

  try {
    return format(parseISO(value), "dd MMM yyyy");
  } catch {
    return value;
  }
}
