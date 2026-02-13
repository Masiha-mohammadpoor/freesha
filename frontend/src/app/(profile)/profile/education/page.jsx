"use client";
import Empty from "@/common/Empty";
import Title from "@/common/Title";
import { PiNotepadDuotone } from "react-icons/pi";
import { FaPlus } from "react-icons/fa";
import Link from "next/link";

const Educations = () => {
  return (
    <section className="h-full relative">
      <Title
        text="تحصیلات"
        icon={<PiNotepadDuotone className="text-secondary text-3xl" />}
        color="primary"
      />
      <article className="mt-16">
        <Empty text="هیچ مدرک تحصیلی وجود ندارد!" url="/images/empty(education).svg"/>
      </article>
      <Link href="/profile/education/add">
        <button className="cursor-pointer absolute bottom-0 left-0  p-4 rounded-full bg-secondary text-txt-secondary text-3xl transition-all duration-300 hover:rotate-180">
          <FaPlus />
        </button>
      </Link>
    </section>
  );
};

export default Educations;
