"use client";

import qs from "query-string";
import { signIn } from "next-auth/react";
import { AiFillGithub } from "react-icons/ai";
import { FcGoogle } from "react-icons/fc";
import { useCallback, useMemo, useState } from "react";
import { Modal } from "./Modal";
import { Heading } from "../Heading";
import { Input } from "../Inputs/Input";
import { toast } from "react-hot-toast";
import { Button } from "../Button";
import { useRouter, useSearchParams } from "next/navigation";
import { useSearchModal } from "@/app/hooks/useSearchModal";
import { Range } from "react-date-range";
import dynamic from "next/dynamic";
import { CountrySelect, CountrySelectValue } from "../Inputs/CountrySelect";
import { formatISO } from "date-fns";
import { Calendar } from "../Inputs/Calendar";
import { Counter } from "../Inputs/Counter";

enum STEPS {
  LOCATION = 0,
  DATE = 1,
  INFO = 2,
}

export const SearchModal = () => {
  const router = useRouter();
  const searchModal = useSearchModal();
  const params = useSearchParams();

  const [location, setLocation] = useState<CountrySelectValue>();
  const [step, setStep] = useState(STEPS.LOCATION);
  const [guestCount, setGuestCount] = useState(1);
  const [roomCount, setRoomCount] = useState(1);
  const [bathroomCount, setBathroomCount] = useState(1);
  const [dateRange, setDateRange] = useState<Range>({
    startDate: new Date(),
    endDate: new Date(),
    key: "selection",
  });

  const Map = useMemo(
    () =>
      dynamic(() => import("../Map"), {
        ssr: false,
      }),
    [location]
  );

  const onBack = useCallback(() => {
    setStep((prev) => prev - 1);
  }, []);

  const onNext = useCallback(() => {
    setStep((prev) => prev + 1);
  }, []);

  const onSubmit = useCallback(async () => {
    if (step !== STEPS.INFO) {
      return onNext();
    }

    let currentQuery = {};

    if (params) {
      currentQuery = qs.parse(params.toString());
    }

    const updatedQuery: any = {
      ...currentQuery,
      locationValue: location?.value,
      guestCount,
      roomCount,
      bathroomCount,
    };

    if (dateRange.startDate) {
      updatedQuery.startDate = formatISO(dateRange.startDate);
    }

    if (dateRange.endDate) {
      updatedQuery.endDate = formatISO(dateRange.endDate);
    }

    const url = qs.stringifyUrl(
      {
        url: "/",
        query: updatedQuery,
      },
      { skipNull: true }
    );

    setStep(STEPS.LOCATION);
    searchModal.onClose();

    router.push(url);
  }, [
    bathroomCount,
    guestCount,
    roomCount,
    dateRange,
    location?.value,
    onNext,
    step,
    params,
    router,
    searchModal,
  ]);

  const actionLabel = useMemo(() => {
    if(step === STEPS.INFO) {
      return 'Search';
    }

    return 'Next';
  }, [step]);

  const secondaryActionLabel = useMemo(() => {
    if(step === STEPS.LOCATION) {
      return undefined;
    }

    return 'Back';
  }, [step]);

  let bodyContent = (
    <div className="flex flex-col gap-8">
      <Heading
        title="Where do you wanna go?"
        subtitle="Find the perfect location"
      />
      <CountrySelect value={location} onChange={value => setLocation(value as CountrySelectValue)}/>
      <hr />
      <Map center={location?.latlng}/>
    </div>
  );

  if(step === STEPS.DATE) {
    bodyContent = (
      <div className="flex flex-col gap-8">
        <Heading
        title="When do you plan to go?"
        subtitle="Make sure everyone is free"
      />
      <Calendar value={dateRange} onChange={value => setDateRange(value.selection)}/>
      </div>
    )
  }

  if(step === STEPS.INFO) {
    bodyContent = (
      <div className="flex flex-col gap-8">
        <Heading
        title="More information"
        subtitle="Find your perfect place"
      />
      <Counter title="Guests" subtitle="How many guests are coming?" value={guestCount} onChange={value => setGuestCount(value)}/>
      <Counter title="Rooms" subtitle="How many rooms do you need?" value={roomCount} onChange={value => setRoomCount(value)}/>
      <Counter title="Bathrooms" subtitle="How many bathrooms do you need?" value={bathroomCount} onChange={value => setBathroomCount(value)}/>
      </div>
    )
  }

  return (
    <Modal
      isOpen={searchModal.isOpen}
      title="Filters"
      actionLabel={actionLabel}
      secondaryActionLabel={secondaryActionLabel}
      secondaryAction={step === STEPS.LOCATION ? undefined : onBack}
      onClose={searchModal.onClose}
      onSubmit={onSubmit}
      body={bodyContent}
    />
  );
};
