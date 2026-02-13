"use client";
import Empty from "@/common/Empty";
import Title from "@/common/Title";
import { PiClockUserDuotone } from "react-icons/pi";
import { FaPlus } from "react-icons/fa";
import Link from "next/link";

const WorkHistory = () => {
  return (
    <section className="h-full relative">
      <Title
        text="سوابق کاری"
        icon={<PiClockUserDuotone className="text-secondary text-3xl" />}
        color="primary"
      />
      <article className="mt-16">
        <Empty text="هیچ سابقه کاری وجود ندارد!" url="/images/empty(workHistory).svg"/>
      </article>
      <Link href="/profile/work-history/add">
        <button className="cursor-pointer absolute bottom-0 left-0  p-4 rounded-full bg-secondary text-txt-secondary text-3xl transition-all duration-300 hover:rotate-180">
          <FaPlus />
        </button>
      </Link>
    </section>
  );
};

export default WorkHistory;
