"use client";
import Empty from "@/common/Empty";
import Title from "@/common/Title";
import {
  PiCalendarDotsDuotone,
  PiFlagCheckeredDuotone,
  PiNotepadDuotone,
} from "react-icons/pi";
import { FaPlus } from "react-icons/fa";
import Link from "next/link";
import { useGetUserData } from "@/hooks/userHooks";
import { v4 as uuidv4 } from "uuid";
import { CiImageOn } from "react-icons/ci";
import dateFormat from "@/utils/dateFormat";

const Educations = () => {
  const { completeUser, completeUserLoading } =
    useGetUserData("educationDegrees");
  console.log(completeUser);

  if (completeUserLoading || !completeUser) return <div>loading...</div>;
  return (
    <section className="h-full relative">
      <Title
        text="تحصیلات"
        icon={<PiNotepadDuotone className="text-secondary text-3xl" />}
        color="primary"
      />
      <article className="mt-16">
        {completeUser?.data?.educationDegrees?.length > 0 ? (
          <div className="grid grid-cols-12 gap-x-4 gap-y-14">
            {completeUser.data.educationDegrees.map((e) => {
              return (
                <div
                  key={uuidv4()}
                  className="col-span-4 bg-white rounded-lg relative h-auto"
                >
                  <div className="absolute -top-7 right-[5%] w-[90%] h-36 bg-gray-300 text-gray-600 text-4xl flex justify-center items-center rounded-lg">
                    <CiImageOn />
                  </div>
                  <div className="h-28 w-full"></div>
                  <div className="w-full p-4 flex flex-col gap-y-3">
                    <h3 className="text-lg text-txt-tertiary font-semibold">
                      {e.title.length > 20
                        ? e.title.slice(0, 20) + "..."
                        : e.title}
                    </h3>
                    <p className="text-sm font-semibold text-primary flex items-end gap-x-1">
                      <PiCalendarDotsDuotone className="text-lg" /> از تاریخ{" "}
                      {dateFormat(e.startDate)}
                    </p>
                    <p className="text-sm font-semibold text-primary flex items-end gap-x-1">
                      <PiFlagCheckeredDuotone className="text-lg" /> تا تاریخ{" "}
                      {dateFormat(e.endDate)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <Empty
            text="هیچ مدرک تحصیلی وجود ندارد!"
            url="/images/empty(education).svg"
          />
        )}
      </article>
      <Link href="/profile/education/add">
        <button className="cursor-pointer fixed bottom-0 left-0 m-12 p-4 rounded-full bg-secondary text-txt-secondary text-3xl transition-all duration-300 hover:rotate-180">
          <FaPlus />
        </button>
      </Link>
    </section>
  );
};

export default Educations;
