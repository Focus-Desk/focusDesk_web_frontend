"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  useGetLibraryByIdQuery,
  useGetTimeSlotsByLibraryIdQuery,
  useGetPlansQuery,
  useGetLockersQuery,
  useGetSeatsByLibraryQuery,
  useGetPackageRulesByLibraryIdQuery,
  useGetOffersQuery,
  useReviewLibraryMutation,
} from "@/state/api";
import {
  Plan,
  TimeSlot,
  Locker,
  PackageRule,
  Offer,
  Library,
} from "@/types/prismaTypes";

type SeatConfiguration = {
  id: number;
  seatNumber: string;
  mode: "Fixed" | "Float" | "Special";
  attachLocker: boolean;
  lockerId: string;
  applicablePlanIds: string[];
};

export interface FullLibrary extends Library {
  timeSlots: TimeSlot[];
  plans: Plan[];
  lockers: Locker[];
  seatConfigurations: SeatConfiguration[];
  packageRules: PackageRule[];
  offers: Offer[];
}

const DetailItem = ({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) => (
  <div>
    <p className="text-sm font-medium text-gray-500">{label}</p>
    <p className="mt-1 text-md text-gray-900">{value || "N/A"}</p>
  </div>
);

const Pill = ({ text }: { text: string }) => (
  <span className="bg-gray-200 text-gray-800 text-xs font-medium px-2.5 py-1 rounded-full">
    {text}
  </span>
);

const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div className="bg-white p-6 rounded-lg shadow-md">
    <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">
      {title}
    </h2>
    <div className="space-y-4">{children}</div>
  </div>
);

const EmptyState = ({ message }: { message: string }) => (
  <div className="text-center py-4 text-gray-500">{message}</div>
);

const TimeSlotCard = ({ timeSlot }: { timeSlot: TimeSlot }) => (
  <div className="p-4 border rounded-md bg-gray-50/70">
    <h3 className="font-semibold text-gray-900">{timeSlot.name}</h3>
    <p className="text-sm text-gray-600">
      {timeSlot.startTime} – {timeSlot.endTime} ({timeSlot.dailyHours} hrs)
    </p>
    <div className="mt-2 flex flex-wrap gap-2">
      {timeSlot.slotPools.map((pool) => (
        <Pill key={pool} text={pool} />
      ))}
    </div>
  </div>
);

const PlanCard = ({
  plan,
  timeSlots,
}: {
  plan: Plan;
  timeSlots: TimeSlot[];
}) => {
  const timeSlot = timeSlots.find((ts) => String(ts.id) === plan.timeSlotId);
  return (
    <div className="p-4 border rounded-md bg-gray-50/70">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-gray-900">{plan.description}</h3>
          <p className="text-sm text-gray-600">
            Type: {plan.planType} | {plan.hours} Hours
          </p>
        </div>
        <p className="font-bold text-lg text-gray-800">₹{plan.price}</p>
      </div>
      {plan.planType === "Fixed" && timeSlot && (
        <p className="text-sm mt-2">
          <strong>Time Slot:</strong> {timeSlot.name} ({timeSlot.startTime} -{" "}
          {timeSlot.endTime})
        </p>
      )}
      {plan.planType === "Float" && (
        <div className="mt-2 flex flex-wrap gap-2">
          <strong>Pools:</strong>{" "}
          {plan.slotPools.map((pool) => (
            <Pill key={pool} text={pool} />
          ))}
        </div>
      )}
    </div>
  );
};

const LockerCard = ({ locker }: { locker: Locker }) => (
  <div className="p-4 border rounded-md bg-gray-50/70">
    <div className="flex justify-between items-start">
      <div>
        <h3 className="font-semibold text-gray-900">{locker.lockerType}</h3>
        <p className="text-sm text-gray-600">
          Quantity: {locker.numberOfLockers}
        </p>
      </div>
      <p className="font-bold text-lg text-gray-800">₹{locker.price}/mo</p>
    </div>
    {locker.description && (
      <p className="text-sm mt-2 text-gray-500">{locker.description}</p>
    )}
  </div>
);

const SeatConfigCard = ({
  config,
  lockers,
}: {
  config: SeatConfiguration;
  plans: Plan[];
  lockers: Locker[];
}) => {
  const attachedLocker = lockers.find((l) => String(l.id) === config.lockerId);
  // const applicablePlans = plans.filter(p => config.applicablePlanIds.includes(String(p.id)));
  return (
    <div className="p-4 border rounded-md bg-gray-50/70">
      <h3 className="font-semibold text-gray-900">
        Seat Range: {config.seatNumber}
      </h3>
      <p className="text-sm text-gray-600">Type: {config.mode}</p>
      {config.lockerId && attachedLocker && (
        <p className="text-sm mt-2">
          <strong>Attached Locker:</strong> {attachedLocker.lockerType}
        </p>
      )}
      {/* {config.mode === 'Special' && applicablePlans.length > 0 && (
                <div className="mt-2">
                    <p className="text-sm font-medium">Applicable Plans:</p>
                    <ul className="list-disc list-inside text-sm text-gray-600">
                        {applicablePlans.map(p => <li key={p.id}>{p.description}</li>)}
                    </ul>
                </div>
            )} */}
    </div>
  );
};

const PackageRuleCard = ({
  rule,
  plans,
}: {
  rule: PackageRule;
  plans: Plan[];
}) => {
  const plan = plans.find((p) => String(p.id) === rule.planId);
  return (
    <div className="p-4 border rounded-md bg-gray-50/70">
      <h3 className="font-semibold text-gray-900">
        {rule.months} Month Package
      </h3>
      <p className="text-sm text-gray-600">
        Applies to: {plan?.description || "N/A"}
      </p>
      <p className="text-lg font-bold text-green-600 mt-1">
        {rule.percentOff}% OFF
      </p>
    </div>
  );
};

const OfferCard = ({ offer, plans }: { offer: Offer; plans: Plan[] }) => {
  const applicablePlans = plans.filter((p) =>
    offer.planIds?.includes(String(p.id))
  );
  return (
    <div className="p-4 border rounded-md bg-gray-50/70">
      <h3 className="font-semibold text-gray-900">{offer.title}</h3>
      {offer.couponCode && (
        <p className="text-sm text-gray-600">
          Code: <strong className="text-indigo-600">{offer.couponCode}</strong>
        </p>
      )}
      <p className="text-lg font-bold text-green-600 mt-1">
        {offer.discountPct
          ? `${offer.discountPct}% OFF`
          : `₹${offer.flatAmount} OFF`}
        {offer.maxDiscount && ` (up to ₹${offer.maxDiscount})`}
      </p>
      <p className="text-xs text-gray-500 mt-2">
        Valid: {offer.validFrom?.toString().split("T")[0]} to{" "}
        {offer.validTo?.toString().split("T")[0]}
      </p>
      <div className="text-xs mt-2 space-x-4">
        <span>New Users Only: {offer.newUsersOnly ? "✅" : "❌"}</span>
        <span>Once Per User: {offer.oncePerUser ? "✅" : "❌"}</span>
      </div>
      {applicablePlans.length > 0 && (
        <div className="mt-2">
          <p className="text-sm font-medium">Applicable Plans:</p>
          <ul className="list-disc list-inside text-sm text-gray-600">
            {applicablePlans.map((p) => (
              <li key={p.id}>{p.description}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default function LibraryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const libraryId = params.libraryId as string;

  const {
    data: library,
    isLoading: isLoadingLibrary,
    refetch,
  } = useGetLibraryByIdQuery(libraryId);
  const { data: timeSlots, isLoading: isLoadingTimeSlots } =
    useGetTimeSlotsByLibraryIdQuery(libraryId);
  const { data: plans, isLoading: isLoadingPlans } =
    useGetPlansQuery(libraryId);
  const { data: lockers, isLoading: isLoadingLockers } =
    useGetLockersQuery(libraryId);
  const { data: seatConfigurations, isLoading: isLoadingSeats } =
    useGetSeatsByLibraryQuery(libraryId);
  const { data: packageRules, isLoading: isLoadingPackageRules } =
    useGetPackageRulesByLibraryIdQuery(libraryId);
  const { data: offers, isLoading: isLoadingOffers } =
    useGetOffersQuery(libraryId);

  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [reviewLibrary, { isLoading: isReviewing }] =
    useReviewLibraryMutation();
  const [rejectionReason, setRejectionReason] = useState("");

  const isLoading =
    isLoadingLibrary ||
    isLoadingTimeSlots ||
    isLoadingPlans ||
    isLoadingLockers ||
    isLoadingSeats ||
    isLoadingPackageRules ||
    isLoadingOffers;
  console.log({
    library,
    timeSlots,
    plans,
    lockers,
    seatConfigurations,
    packageRules,
    offers,
  });
  const handleApprove = async () => {
    try {
      await reviewLibrary({ libraryId, status: "APPROVED" }).unwrap();
      refetch();
    } catch (error) {
      console.error("Failed to approve library:", error);
    }
  };

  const handleReject = async () => {
    try {
      if (!rejectionReason.trim()) {
        alert("Please provide a reason for rejection");
        return;
      }

      await reviewLibrary({
        libraryId,
        status: "REJECTED",
        reason: rejectionReason,
      }).unwrap();
      refetch();
      setIsRejectModalOpen(false);
      setRejectionReason("");
    } catch (error) {
      console.error("Failed to reject library:", error);
    }
  };
  const handleEdit = () => {
    router.push(`/super-admin/libraries/${libraryId}/edit`);
  };

  if (isLoading)
    return <div className="p-8 text-center">Loading library details...</div>;
  if (!library)
    return <div className="p-8 text-center">Library not found.</div>;

  return (
    <>
      <div className="bg-gray-100 min-h-screen p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                {library.libraryName}
              </h1>
              <p className="text-gray-500">
                {library.area}, {library.city}
              </p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setIsRejectModalOpen(true)}
                className="border-2 border-red-500 text-red-500 px-4 py-2 rounded-md hover:bg-red-100 font-semibold"
                disabled={isReviewing || library.reviewStatus === "REJECTED"}
              >
                {library.reviewStatus === "REJECTED" ? "Rejected" : "Reject"}
              </button>
              <button
                onClick={handleApprove}
                className="border-2 border-green-500 text-green-500 px-4 py-2 rounded-md hover:bg-green-100 font-semibold"
                disabled={isReviewing || library.reviewStatus === "APPROVED"}
              >
                {library.reviewStatus === "APPROVED" ? "Approved" : "Approve"}
              </button>
              <button
                onClick={handleEdit}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
              >
                Edit Library
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <Section title="Library Information">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  <DetailItem
                    label="Status"
                    value={
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          library.reviewStatus === "APPROVED"
                            ? "bg-green-100 text-green-800"
                            : library.reviewStatus === "REJECTED"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {library.reviewStatus}
                      </span>
                    }
                  />
                  <DetailItem label="Total Seats" value={library.totalSeats} />
                  <DetailItem
                    label="Contact Number"
                    value={library.PersoncontactNumber}
                  />
                  <DetailItem
                    label="Opening - Closing Time"
                    value={library.openingTime +" - "+ library.closingTime}
                  />
                  <DetailItem
                    label="Address"
                    value={`${library.address}, ${library.city}, ${library.state} - ${library.pincode}`}
                  />
                  <DetailItem
                    label="Google Maps"
                    value={
                      library.googleMapLink ? (
                        <a
                          href={library.googleMapLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          View Map
                        </a>
                      ) : (
                        "N/A"
                      )
                    }
                  />
                </div>
              </Section>
              <Section title="Time Slots">
                {timeSlots?.length > 0 ? (
                  timeSlots.map((ts) => (
                    <TimeSlotCard key={ts.id} timeSlot={ts} />
                  ))
                ) : (
                  <EmptyState message="No time slots defined." />
                )}
              </Section>
              <Section title="Plans">
                {plans?.length > 0 ? (
                  plans.map((p) => (
                    <PlanCard key={p.id} plan={p} timeSlots={timeSlots || []} />
                  ))
                ) : (
                  <EmptyState message="No plans defined." />
                )}
              </Section>
              <Section title="Lockers">
                {lockers?.length > 0 ? (
                  lockers.map((l) => <LockerCard key={l.id} locker={l} />)
                ) : (
                  <EmptyState message="No lockers defined." />
                )}
              </Section>
               
              <Section title="Seat Configurations">
                {seatConfigurations?.length > 0 ? (
                  seatConfigurations.map((sc) => (
                    <SeatConfigCard
                      key={sc.id}
                      config={sc}
                      plans={plans || []}
                      lockers={lockers || []}
                    />
                  ))
                ) : (
                  <EmptyState message="No seat configurations defined." />
                )}
              </Section>
               
              <Section title="Package Rules">
                {packageRules?.length > 0 ? (
                  packageRules.map((pr) => (
                    <PackageRuleCard
                      key={pr.id}
                      rule={pr}
                      plans={plans || []}
                    />
                  ))
                ) : (
                  <EmptyState message="No package rules defined." />
                )}
              </Section>
               
              <Section title="Offers">
                {offers?.length > 0 ? (
                  offers.map((o) => (
                    <OfferCard key={o.id} offer={o} plans={plans || []} />
                  ))
                ) : (
                  <EmptyState message="No offers defined." />
                )}
              </Section>
            </div>

            <div className="space-y-8">
              <Section title="Manager & Librarian">
                <DetailItem
                  label="Librarian"
                  value={`${library.contactPersonName}`}
                />
                <hr className="my-4" />
                <DetailItem label="Manager Name" value={library.managerName} />
                <DetailItem
                  label="Manager Contact"
                  value={library.managerPhone}
                />
              </Section>
              <Section title="Facilities">
                <ul className="flex flex-wrap gap-2">
                  {library.facilities?.map((f) => (
                    <li
                      key={f}
                      className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full"
                    >
                      {f}
                    </li>
                  ))}
                </ul>
              </Section>
            </div>
          </div>
        </div>
      </div>
      {isRejectModalOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setIsRejectModalOpen(false)}
        >
          <div
            className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-4">Reason for Rejection</h2>
            <p className="text-gray-600 mb-4">
              This will be sent to the librarian.
            </p>
            <textarea
              className="w-full p-2 border border-gray-300 rounded-md h-32"
              placeholder="e.g., Photos are unclear, address is incomplete..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
            />
            <div className="mt-6 flex justify-end gap-4">
              <button
                onClick={() => setIsRejectModalOpen(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={isReviewing || !rejectionReason.trim()}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
              >
                {isReviewing ? "Rejecting..." : "Confirm Rejection"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
