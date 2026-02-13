"use client";
import Btn from "@/common/Btn";
import Title from "@/common/Title";
import DateInput from "@/components/DateInput";
import FormInput from "@/components/FormInput";
import ImageUploader from "@/components/Profile/ImageUploader";
import TextArea from "@/components/TextArea";
import { PiCodeDuotone } from "react-icons/pi";
import SkillsSelector from "@/components/Profile/SkillsSelector";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useGetUserData, useUpdateUser } from "@/hooks/userHooks";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

const defaultValues = {
  title: "",
  projectUrl: "",
  skills: null,
  description: "",
};
const schema = yup.object({
  title: yup
    .string()
    .required("عنوان الزامی است")
    .min(2, "عنوان باید حداقل 2 کاراکتر باشد")
    .max(100, "عنوان نمی‌تواند بیشتر از 100 کاراکتر باشد"),
  projectUrl: yup
    .string()
    .url("لینک معتبر نیست")
    .required("لینک پروژه الزامی است"),
  skills: yup
    .array()
    .of(yup.string())
    .required("لیست مهارت های به کار رفته الزامی است"),
  description: yup
    .string()
    .max(1000, "توضیحات نمی‌تواند بیشتر از 1000 کاراکتر باشد")
    .optional(),
});

const AddPortfolio = () => {
  const router = useRouter();
  const { mutateAsync } = useUpdateUser();
  const { completeUser, completeUserLoading } = useGetUserData("portfolios");
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isValid, isDirty, isSubmitting },
  } = useForm({
    defaultValues,
    resolver: yupResolver(schema),
    mode: "onTouched",
  });

  const updateHandler = async (data) => {
    try {
      const res = await mutateAsync({
        id: completeUser.data.id,
        data: { portfolios: [...completeUser.data.portfolios, data] },
      });
      queryClient.invalidateQueries({
        queryKey: ["complete-user", completeUser.data.id, "portfolios"],
      });
      router.push("/profile/portfolio");
    } catch (err) {
      console.log(err);
    }
  };

  if (completeUserLoading) return <div>loading ...</div>;
  return (
    <section>
      <Title
        text="افزودن نمونه کار"
        icon={<PiCodeDuotone className="text-secondary text-3xl" />}
        color="primary"
      />
      <article className="mt-16">
        <form
          onSubmit={handleSubmit(updateHandler)}
          className="grid grid-cols-9 gap-5 items-start"
        >
          <FormInput
            register={register}
            errors={errors}
            className="col-span-6"
            label="عنوان"
            name="title"
          />
          <FormInput
            register={register}
            errors={errors}
            className="col-span-6"
            label="لینک پروژه"
            name="projectUrl"
          />
          <div className="col-span-6">
            <SkillsSelector control={control} errors={errors} />
          </div>
          <TextArea
            register={register}
            errors={errors}
            label="توضیحات"
            name="description"
            className="col-span-9"
          />
          <div className="col-span-9 my-5">
            <ImageUploader />
          </div>

          <div className="col-span-9">
            <Btn
              text="به روزرسانی"
              type="submit"
              disabled={!isValid || !isDirty || isSubmitting}
            />
          </div>
        </form>
      </article>
    </section>
  );
};

export default AddPortfolio;
