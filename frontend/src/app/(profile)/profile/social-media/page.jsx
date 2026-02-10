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

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isDirty, isSubmitting },
  } = useForm({
    defaultValues: {
      link: "",
    },
    resolver: yupResolver(schema),
    mode: "onTouched",
  });

  const addLinkHandler = async (data) => {
    console.log(data);
    try {
      const res = await mutateAsync({
        id: completeUser.data.id,
        data: { socialLinks: [...completeUser.data.socialLinks, data.link] },
      });
      console.log(res);
    } catch (err) {
      console.log(err);
    }
  };

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
        <Empty text="هیچ لینکی موجود نیست" url="/images/empty(link).svg" />
      </article>
    </section>
  );
};

export default SocialMedia;
