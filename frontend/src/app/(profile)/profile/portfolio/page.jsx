"use client";
import Empty from "@/common/Empty";
import Title from "@/common/Title";
import { PiCodeDuotone } from "react-icons/pi";
import { FaPlus } from "react-icons/fa";
import Link from "next/link";
import { useGetUserData } from "@/hooks/userHooks";
import { v4 as uuidv4 } from "uuid";
import { CiImageOn } from "react-icons/ci";
import { GoLink } from "react-icons/go";
import { TbArrowBadgeLeftFilled } from "react-icons/tb";


const Portfolio = () => {
  const { completeUser, completeUserLoading } = useGetUserData("portfolios");
  console.log(completeUser);

  if (completeUserLoading || !completeUser) return <div>loading...</div>;
  return (
    <>
    <section className="relative">
      <Title
        text="نمونه کارها"
        icon={<PiCodeDuotone className="text-secondary text-3xl" />}
        color="primary"
      />
      <article className="mt-16">
        {completeUser?.data?.portfolios?.length > 0 ? (
          <div className="grid grid-cols-12 gap-x-4 gap-y-14">
            {completeUser.data.portfolios.map((p) => {
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
                      {p.title}
                    </h3>
                    <Link href={p.projectUrl} target="_blank">
                      <p className="flex items-end gap-x-2 text-secondary">
                        <GoLink /> لینک پروژه
                      </p>
                    </Link>
                    {/* <p className="mt-2 text-sm text-txt-tertiary leading-6 h-14">{p.description.slice(0,70) + "..."}</p> */}
                    <Link href="/" className="text-primary text-sm font-semibold flex items-end gap-x-1 underline">اطلاعات بیشتر <TbArrowBadgeLeftFilled/></Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <Empty
            text="هیچ نمونه کاری وجود ندارد!"
            url="/images/empty(portfolio).svg"
          />
        )}
      </article>
    </section>
      <Link href="/profile/portfolio/add">
        <button className="cursor-pointer fixed bottom-0 left-0 m-12 p-4 rounded-full bg-secondary text-txt-secondary text-3xl transition-all duration-300 hover:rotate-180">
          <FaPlus />
        </button>
      </Link>
      </>
  );
};

export default Portfolio;
