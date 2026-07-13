"use client";

import { useState } from "react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { LocationPicker } from "@/components/shared/LocationPicker";
import { PageHeader } from "@/components/shared/PageHeader";
import { SectionCard } from "@/components/shared/SectionCard";
import {
  assignmentOptionsBySite,
  connectionTypeOptions,
  customerStageOptions,
  customerStatusOptions,
  projectOptions,
  siteOptionsByProject,
} from "../services/customers.service";
import type { Customer, CustomerFormValues } from "../types/customer.types";
import { CustomerBreadcrumb } from "./CustomerBreadcrumb";

const defaultValues: CustomerFormValues = {
  name: "",
  mobileNumber: "",
  fullAddress: "",
  projectId: "",
  siteArea: "",
  city: "",
  latitude: "",
  longitude: "",
  bpTrNumber: "",
  connectionType: "Domestic",
  houseType: "",
  scheme: "",
  paymentStatus: "Pending",
  paymentMode: "",
  initialAmount: "",
  supervisor: "",
  plumberGroup: "",
  fieldExecutive: "",
  meterNumber: "",
  meterType: "",
  regulatorNumber: "",
  regulatorPressure: "",
  currentStage: "Lead",
  status: "Draft",
  surveyDate: "",
  installationDate: "",
  testingDate: "",
  commissioningDate: "",
  conversionDate: "",
  meterReading: "",
  nonConversionRemarks: "",
  giBillDone: false,
  gcBillDone: false,
  conversionBillDone: false,
};

interface CustomerFormProps {
  mode: "create" | "edit";
  customer?: Customer;
}

export function CustomerForm({ mode, customer }: CustomerFormProps) {
  const isEdit = mode === "edit";
  const values = customer ?? defaultValues;
  const [selectedProject, setSelectedProject] = useState(values.projectId);
  const [selectedSite, setSelectedSite] = useState(values.siteArea);
  const [coordinates, setCoordinates] = useState({
    latitude: Number(values.latitude) || 26.8951,
    longitude: Number(values.longitude) || 75.7684,
  });
  const siteOptions = getOptionsWithFallback(
    siteOptionsByProject[selectedProject] ?? [],
    values.siteArea,
  );
  const assignmentOptions = assignmentOptionsBySite[selectedSite] ?? {
    supervisors: values.supervisor ? [values.supervisor] : [],
    plumbers: values.plumberGroup ? [values.plumberGroup] : [],
    fieldExecutives: values.fieldExecutive ? [values.fieldExecutive] : [],
  };

  return (
    <div>
      <CustomerBreadcrumb
        items={[
          { label: "Customers", href: "/customers" },
          ...(isEdit && customer
            ? [
                { label: customer.name, href: `/customers/${customer.id}` },
                { label: "Edit" },
              ]
            : [{ label: "Create Customer" }]),
        ]}
      />

      <PageHeader
        title={isEdit ? "Edit Customer" : "Create Customer"}
        subtitle={
          isEdit
            ? "Update customer connection, assignment, and meter details."
            : "Add customer master, connection, assignment, and meter details."
        }
      />

      <form className="space-y-4 pb-20">
        <SectionCard title="Basic Details">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <Field label="Customer Name">
              <Input defaultValue={values.name} placeholder="Rajesh Kumar" />
            </Field>
            <Field label="Mobile Number">
              <Input defaultValue={values.mobileNumber} placeholder="9876543210" />
            </Field>
            <Field label="Project">
              <Select
                value={selectedProject || undefined}
                onValueChange={(projectId) => {
                  const nextProjectId = projectId ?? "";
                  setSelectedProject(nextProjectId);
                  const nextSite = siteOptionsByProject[nextProjectId]?.[0] ?? "";
                  setSelectedSite(nextSite);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  {projectOptions.map((project) => (
                    <SelectItem key={project.value} value={project.value}>
                      {project.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Site / Area">
              <Select
                value={selectedSite || undefined}
                onValueChange={(site) => setSelectedSite(site ?? "")}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select site / area" />
                </SelectTrigger>
                <SelectContent>
                  {siteOptions.map((site) => (
                    <SelectItem key={site} value={site}>
                      {site}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="City">
              <Input defaultValue={values.city} placeholder="Jaipur" />
            </Field>
            <Field label="GPS Location">
              <div className="grid grid-cols-2 gap-2">
                <Input value={coordinates.latitude} readOnly placeholder="Latitude" />
                <Input value={coordinates.longitude} readOnly placeholder="Longitude" />
              </div>
            </Field>
            <Field label="Full Address" className="md:col-span-2 xl:col-span-3">
              <Textarea
                defaultValue={values.fullAddress}
                placeholder="Full customer address"
                rows={3}
              />
            </Field>
            <Field label="Pick on Map" className="md:col-span-2 xl:col-span-3">
              <LocationPicker
                latitude={coordinates.latitude}
                longitude={coordinates.longitude}
                heightClassName="h-56"
                onChange={(nextCoordinates) => setCoordinates(nextCoordinates)}
              />
            </Field>
          </div>
        </SectionCard>

        <SectionCard title="Connection Details">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <Field label="BP / TR Number">
              <Input defaultValue={values.bpTrNumber} placeholder="BP-100245" />
            </Field>
            <Field label="Connection Type">
              <Select defaultValue={values.connectionType}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {connectionTypeOptions.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="House Type">
              <Input defaultValue={values.houseType} placeholder="Independent House" />
            </Field>
            <Field label="Scheme">
              <Input defaultValue={values.scheme} placeholder="Standard PNG" />
            </Field>
            <Field label="Payment Status">
              <Select defaultValue={values.paymentStatus}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select payment status" />
                </SelectTrigger>
                <SelectContent>
                  {["Pending", "In Review", "Approved", "Rejected"].map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Payment Mode">
              <Input defaultValue={values.paymentMode} placeholder="UPI / Cash / Cheque" />
            </Field>
            <Field label="Initial Amount">
              <Input defaultValue={values.initialAmount} placeholder="3500" />
            </Field>
            <Field label="Current Stage">
              <Select defaultValue={values.currentStage}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select stage" />
                </SelectTrigger>
                <SelectContent>
                  {customerStageOptions.map((stage) => (
                    <SelectItem key={stage} value={stage}>
                      {stage}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Status">
              <Select defaultValue={values.status}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {customerStatusOptions.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>
        </SectionCard>

        <SectionCard title="Assignment">
          <div className="grid gap-4 md:grid-cols-3">
            <Field label="Supervisor">
              <Select defaultValue={values.supervisor || undefined}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select supervisor" />
                </SelectTrigger>
                <SelectContent>
                  {getOptionsWithFallback(
                    assignmentOptions.supervisors,
                    values.supervisor,
                  ).map((supervisor) => (
                    <SelectItem key={supervisor} value={supervisor}>
                      {supervisor}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Plumber / Group">
              <Select defaultValue={values.plumberGroup || undefined}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select plumber / group" />
                </SelectTrigger>
                <SelectContent>
                  {getOptionsWithFallback(
                    assignmentOptions.plumbers,
                    values.plumberGroup,
                  ).map((plumber) => (
                    <SelectItem key={plumber} value={plumber}>
                      {plumber}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Field Executive">
              <Select defaultValue={values.fieldExecutive || undefined}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select field executive" />
                </SelectTrigger>
                <SelectContent>
                  {getOptionsWithFallback(
                    assignmentOptions.fieldExecutives,
                    values.fieldExecutive,
                  ).map((executive) => (
                    <SelectItem key={executive} value={executive}>
                      {executive}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>
        </SectionCard>

        <SectionCard title="Meter & Regulator Details">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Field label="Meter Number">
              <Input defaultValue={values.meterNumber} placeholder="MTR-77881" />
            </Field>
            <Field label="Meter Type">
              <Input defaultValue={values.meterType} placeholder="Smart Meter" />
            </Field>
            <Field label="Regulator Number">
              <Input defaultValue={values.regulatorNumber} placeholder="REG-2219" />
            </Field>
            <Field label="Regulator Pressure">
              <Input defaultValue={values.regulatorPressure} placeholder="21 mbar" />
            </Field>
          </div>
        </SectionCard>

        <div className="sticky bottom-0 -mx-1 flex justify-end gap-2 border-t border-border bg-background/95 px-1 py-3 backdrop-blur">
          <Link
            href={isEdit && customer ? `/customers/${customer.id}` : "/customers"}
            className={buttonVariants({ variant: "outline", size: "default" })}
          >
            Cancel
          </Link>
          {!isEdit ? (
            <Button type="button" variant="outline">
              Save Draft
            </Button>
          ) : null}
          <Button type="button">{isEdit ? "Save Changes" : "Create Customer"}</Button>
        </div>
      </form>
    </div>
  );
}

function getOptionsWithFallback(options: string[], fallback: string) {
  return Array.from(new Set([...options, fallback].filter(Boolean)));
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <Label className="mb-1.5 block text-xs font-medium text-foreground">{label}</Label>
      {children}
    </div>
  );
}
