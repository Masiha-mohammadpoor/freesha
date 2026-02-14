"use client";
import Empty from "@/common/Empty";
import Title from "@/common/Title";
import { PiClockUserDuotone } from "react-icons/pi";
import { FaPlus } from "react-icons/fa";
import Link from "next/link";
import { useGetUserData } from "@/hooks/userHooks";
import { v4 as uuidv4 } from "uuid";
import dateFormat from "@/utils/dateFormat";
import {
  PiBuildingOfficeDuotone,
  PiFlagCheckeredDuotone,
  PiCalendarDotsDuotone,
} from "react-icons/pi";
import { TbArrowBadgeLeftFilled } from "react-icons/tb";

const WorkHistory = () => {
  const { completeUser, completeUserLoading } =
    useGetUserData("workExperiences");
  console.log(completeUser);

  if (completeUserLoading || !completeUser) return <div>loading...</div>;
  return (
    <>
      <section className="h-full relative">
        <Title
          text="سوابق کاری"
          icon={<PiClockUserDuotone className="text-secondary text-3xl" />}
          color="primary"
        />
        <article className="mt-16">
          {completeUser?.data?.workExperiences?.length > 0 ? (
            <div className="grid grid-cols-12 gap-x-4 gap-y-14">
              {completeUser.data.workExperiences.map((w) => {
                return (
                  <div
                    key={uuidv4()}
                    className="col-span-4 bg-white rounded-lg relative h-auto"
                  >
                    <div className="w-full p-4 flex flex-col gap-y-3">
                      <h3 className="text-lg text-txt-tertiary font-semibold">
                        {w.jobTitle}
                      </h3>
                      <h5 className="flex items-center gap-x-1 text-secondary">
                        <PiBuildingOfficeDuotone /> شرکت : {w.company}
                      </h5>
                      <p className="text-sm font-semibold text-primary flex items-end gap-x-1">
                        <PiCalendarDotsDuotone className="text-lg" /> از تاریخ{" "}
                        {dateFormat(w.startDate)}
                      </p>
                      <p className="text-sm font-semibold text-primary flex items-end gap-x-1">
                        <PiFlagCheckeredDuotone className="text-lg" /> تا تاریخ{" "}
                        {dateFormat(w.endDate)}
                      </p>
                      <Link
                        href="/"
                        className="text-primary text-sm font-semibold flex items-end gap-x-1 underline"
                      >
                        اطلاعات بیشتر <TbArrowBadgeLeftFilled />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <Empty
              text="هیچ سابقه کاری وجود ندارد!"
              url="/images/empty(workHistory).svg"
            />
          )}
        </article>
      </section>
      <Link href="/profile/work-history/add">
        <button className="cursor-pointer fixed bottom-0 left-0 m-12 p-4 rounded-full bg-secondary text-txt-secondary text-3xl transition-all duration-300 hover:rotate-180">
          <FaPlus />
        </button>
      </Link>
    </>
  );
};

export default WorkHistory;
