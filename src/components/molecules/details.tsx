import { addressFormat } from "@/lib/helpers";
import { Copy, Skeleton } from "@/components/ui";

export const DetailRow = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div className="w-full flex flex-row justify-between items-center my-2">
    <span>{label}</span>
    {children}
  </div>
);

export const AddressDetailRow = ({
  label,
  value,
}: {
  label: string;
  value: string;
}) => (
  <div className="w-full flex flex-row justify-between items-center my-2">
    <span>{label}</span>
    {value?.length > 8 ? (
      <div className="flex flex-row items-center text-gray-800">
        {addressFormat(value)}
        <Copy textToCopy={value} />
      </div>
    ) : (
      <Skeleton className="w-16 h-4" />
    )}
  </div>
);