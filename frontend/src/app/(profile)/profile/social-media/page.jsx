"use client";
import Btn from "@/common/Btn";
import Title from "@/common/Title";
import FormInput from "@/components/FormInput";
import { PiTelegramLogoDuotone } from "react-icons/pi";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useForm } from "react-hook-form";
import Empty from "@/common/Empty";
import { useGetUserData, useUpdateUser } from "@/hooks/userHooks";
import { FaTrashAlt } from "react-icons/fa";
import SocialLinkIcon from "@/components/Profile/SocialLinkIcon";
import { useQueryClient } from "@tanstack/react-query";

const schema = yup
  .object({
    link: yup
      .string()
      .required("لینک الزامی است")
      .test(
        "valid-social-link",
        "فقط لینک شبکه‌های اجتماعی مجاز قابل قبول است",
        function (value) {
          if (!value) return false;

          // Authorized domains
          const allowedDomains = [
            "instagram.com",
            "twitter.com",
            "x.com",
            "linkedin.com",
            "github.com",
            "t.me",
            "telegram.me",
            "facebook.com",
            "fb.com",
          ];

          try {
            const url = new URL(value);
            const hostname = url.hostname.replace(/^www\./, "");

            if (!allowedDomains.includes(hostname)) {
              return false;
            }

            const path = url.pathname.replace(/^\/|\/$/g, "");

            switch (hostname) {
              case "instagram.com":
                return /^[A-Za-z0-9_.]+$/.test(path) && path.length > 0;

              case "twitter.com":
              case "x.com":
                return /^[A-Za-z0-9_]+$/.test(path) && path.length > 0;

              case "linkedin.com":
                return /^in\/[A-Za-z0-9-]+$/.test(path) && path.length > 2;

              case "github.com":
                return /^[A-Za-z0-9_-]+$/.test(path) && path.length > 0;

              case "t.me":
              case "telegram.me":
                return /^[A-Za-z0-9_]+$/.test(path) && path.length > 0;

              case "facebook.com":
              case "fb.com":
                return (
                  /^(profile\.php\?id=\d+|[A-Za-z0-9_.]+)$/.test(path) &&
                  path.length > 0
                );

              default:
                return false;
            }
          } catch {
            return false;
          }
        },
      ),
  })
  .required();

const SocialMedia = () => {
  const { mutateAsync } = useUpdateUser();
  const { completeUser, completeUserLoading } = useGetUserData("socialLinks");
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid, isDirty, isSubmitting },
  } = useForm({
    defaultValues: {
      link: "",
    },
    resolver: yupResolver(schema),
    mode: "onTouched",
  });

  const addLinkHandler = async (data) => {
    try {
      const res = await mutateAsync({
        id: completeUser.data.id,
        data: { socialLinks: [...completeUser.data.socialLinks, data.link] },
      });
      queryClient.invalidateQueries({
        queryKey: ["complete-user", completeUser.data.id, "socialLinks"],
      });
      reset();
    } catch (err) {
      console.log(err);
    }
  };

  const deleteHandler = async (link) => {
    const filteredLinks = completeUser.data.socialLinks.filter(
      (l) => l !== link,
    );
    try {
      const res = await mutateAsync({
        id: completeUser.data.id,
        data: { socialLinks: filteredLinks },
      });
      queryClient.invalidateQueries({
        queryKey: ["complete-user", completeUser.data.id, "socialLinks"],
      });
      reset();
    } catch (err) {
      console.log(err);
    }
  };

  if (completeUserLoading || !completeUser) return <div>loading...</div>;
  return (
    <section>
      <Title
        text="شبکه‌های اجتماعی"
        icon={<PiTelegramLogoDuotone className="text-secondary text-3xl" />}
        color="primary"
      />
      <article className="mt-16">
        <form
          onSubmit={handleSubmit(addLinkHandler)}
          className="w-full h-fit flex justify-center items-end gap-x-4"
        >
          <FormInput
            name="link"
            register={register}
            className="w-[50%]"
            label="لینک شبکه‌های اجتماعی"
          />
          <Btn
            disabled={!isValid || !isDirty || isSubmitting}
            type="submit"
            color="primary"
            text="افزودن"
            className="mb-3"
          />
        </form>
        {completeUser?.data?.socialLinks.length > 0 ? (
          <div className="flex flex-col justify-center items-center gap-3 mt-5">
            {completeUser.data.socialLinks.map((l) => {
              return (
                <div
                  key={l}
                  className="w-[70%] h-10 rounded-lg border-2 border-secondary flex justify-between items-center overflow-hidden"
                >
                  <button
                    onClick={() => deleteHandler(l)}
                    className="px-3 text-error cursor-pointer text-xl"
                  >
                    <FaTrashAlt />
                  </button>
                  <div className="flex">
                    <p className="flex items-center pl-5 text-primary">{l}</p>
                    <span className="h-10 w-auto px-3 bg-secondary flex justify-center items-center text-xl text-primary">
                      <SocialLinkIcon url={l} />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <Empty text="هیچ لینکی موجود نیست!" url="/images/empty(link).svg" />
        )}
      </article>
    </section>
  );
};

export default SocialMedia;
