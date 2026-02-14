"use client";
import Btn from "@/common/Btn";
import Title from "@/common/Title";
import DateInput from "@/components/DateInput";
import FormInput from "@/components/FormInput";
import TextArea from "@/components/TextArea";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Controller, useForm } from "react-hook-form";
import { PiClockUserDuotone } from "react-icons/pi";
import { useGetUserData, useUpdateUser } from "@/hooks/userHooks";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

const defaultValues = {
  jobTitle: "",
  company: "",
  startDate: "",
  endDate: "",
  description: "",
};

const schema = yup.object({
  jobTitle: yup
    .string()
    .required("عنوان شغلی الزامی است")
    .min(2, "عنوان شغلی باید حداقل 2 کاراکتر باشد")
    .max(100, "عنوان شغلی نمی‌تواند بیشتر از 100 کاراکتر باشد"),
  company: yup
    .string()
    .required("نام شرکت الزامی است")
    .max(100, "نام شرکت نمیتواند بیشتر از 100 کاراکتر باشد"),
  startDate: yup
    .string()
    .required("تاریخ شروع الزامی است")
    .matches(/^\d{4}-\d{2}-\d{2}$/, "فرمت تاریخ باید YYYY-MM-DD باشد"),
  endDate: yup
    .string()
    .required("تاریخ پایان الزامی است")
    .matches(/^\d{4}-\d{2}-\d{2}$/, "فرمت تاریخ باید YYYY-MM-DD باشد"),
  description: yup
    .string()
    .optional()
    .max(1000, "توضیحات نمیتواند بیشتر از 1000 کاراکتر باشد"),
});

const AddWorkHistory = () => {
  const router = useRouter();
  const { mutateAsync } = useUpdateUser();
  const { completeUser, completeUserLoading } =
    useGetUserData("workExperiences");
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
        data: { workExperiences: [...completeUser.data.workExperiences, data] },
      });
      queryClient.invalidateQueries({
        queryKey: ["complete-user", completeUser.data.id, "workExperiences"],
      });
      router.push("/profile/work-history");
    } catch (err) {
      console.log(err);
    }
  };

  if (completeUserLoading) return <div>loading...</div>;
  return (
    <section>
      <Title
        text="افزودن سابقه کاری"
        icon={<PiClockUserDuotone className="text-secondary text-3xl" />}
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
            label="عنوان شغلی"
            name="jobTitle"
          />
          <FormInput
            register={register}
            errors={errors}
            className="col-span-6"
            label="شرکت"
            name="company"
          />
          <Controller
            name="startDate"
            control={control}
            render={({ field }) => (
              <DateInput
                {...field}
                name="startDate"
                label="تاریخ شروع"
                className="col-span-6"
                errors={errors}
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />

          <Controller
            name="endDate"
            control={control}
            render={({ field }) => (
              <DateInput
                {...field}
                name="endDate"
                label="تاریخ پایان"
                className="col-span-6"
                errors={errors}
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
          <TextArea
            register={register}
            errors={errors}
            className="col-span-8"
            label="توضیحات"
            name="description"
          />
          <div className="col-span-9">
            <Btn
              text="افزودن"
              type="submit"
              disabled={!isValid || !isDirty || isSubmitting}
            />
          </div>
        </form>
      </article>
    </section>
  );
};

export default AddWorkHistory;
