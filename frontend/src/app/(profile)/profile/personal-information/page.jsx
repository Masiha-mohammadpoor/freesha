"use client";
import Btn from "@/common/Btn";
import Title from "@/common/Title";
import DateInput from "@/components/DateInput";
import FormInput from "@/components/FormInput";
import TextArea from "@/components/TextArea";
import { PiUserDuotone } from "react-icons/pi";
import Select from "@/components/Select";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useGetUserData, useUpdateUser } from "@/hooks/userHooks";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

const genderOptions = [
  { value: "1", label: "نامشخص" },
  { value: "2", label: "آقا" },
  { value: "3", label: "خانم" },
];

const defaultValues = {
  name: "",
  jobTitle: "",
  birthDate: "",
  phoneNumber: "",
  genderId: "",
  postalCode: "",
  homeAddress: "",
  bio: "",
};

const schema = yup.object({
  name: yup
    .string()
    .required("نام الزامی است")
    .min(3, "نام باید حداقل 3 کاراکتر باشد"),
  jobTitle: yup
    .string()
    .required("عنوان شغلی الزامی است")
    .min(2, "عنوان شغلی باید حداقل 2 کاراکتر باشد")
    .max(100, "عنوان شغلی نمی‌تواند بیشتر از 100 کاراکتر باشد"),
  birthDate: yup
    .string()
    .required("تاریخ تولد الزامی است")
    .matches(/^\d{4}-\d{2}-\d{2}$/, "فرمت تاریخ باید YYYY-MM-DD باشد"),
  phoneNumber: yup
    .string()
    .required("شماره تلفن الزامی است")
    .matches(/^09\d{9}$/, "شماره تلفن باید با 09 شروع شود و 11 رقمی باشد"),
  genderId: yup
    .string()
    .required("جنسیت الزامی است")
    .oneOf(["2", "3"], "جنسیت معتبر نیست"),
  postalCode: yup
    .string()
    .required("کد پستی الزامی است")
    .matches(/^\d{10}$/, "کد پستی باید 10 رقم باشد"),
  homeAddress: yup
    .string()
    .required("آدرس الزامی است")
    .min(10, "آدرس باید حداقل 10 کاراکتر باشد")
    .max(500, "آدرس نمی‌تواند بیشتر از 500 کاراکتر باشد"),
  bio: yup
    .string()
    .max(1000, "بیوگرافی نمی‌تواند بیشتر از 1000 کاراکتر باشد")
    .optional(),
});

const PersonalInformation = () => {
  const { mutateAsync } = useUpdateUser();
  const { completeUser, completeUserLoading } = useGetUserData();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isValid, isDirty, isSubmitting },
  } = useForm({
    defaultValues,
    resolver: yupResolver(schema),
    mode: "onTouched",
  });

  useEffect(() => {
    if (completeUser && !completeUserLoading) {
      const {
        name,
        jobTitle,
        birthDate,
        phoneNumber,
        genderName,
        postalCode,
        homeAddress,
        bio,
      } = completeUser.data;
      reset({
        name,
        jobTitle,
        birthDate,
        phoneNumber,
        genderId: genderName === "M" ? "2" : genderName === "F" ? "3" : "1",
        postalCode,
        homeAddress,
        bio,
      });
    }
  }, [reset, completeUser, completeUserLoading]);

  const updateHandler = async (data) => {
    try {
      const res = await mutateAsync({ id: completeUser.data.id, data });
      reset();
      queryClient.invalidateQueries({queryKey:["complete-user", completeUser.data.id]});
    } catch (err) {
      console.log(err);
    }
  };

  if (completeUserLoading) return <p>loading...</p>;
  return (
    <section>
      <Title
        text="اطلاعات شخصی"
        icon={<PiUserDuotone className="text-secondary text-3xl" />}
        color="primary"
      />
      <article className="mt-16">
        <form
          onSubmit={handleSubmit(updateHandler)}
          className="grid grid-cols-9 gap-5 mt-10 items-start"
        >
          <FormInput
            register={register}
            errors={errors}
            className="col-span-6"
            label="نام و نام‌خانوادگی"
            name="name"
          />
          <FormInput
            register={register}
            errors={errors}
            className="col-span-6"
            label="عنوان شغلی"
            name="jobTitle"
          />
          <Controller
            name="birthDate"
            control={control}
            render={({ field }) => (
              <DateInput
                {...field}
                name="birthDate"
                label="تاریخ تولد"
                className="col-span-6"
                errors={errors}
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
          <FormInput
            register={register}
            errors={errors}
            className="col-span-6"
            label="شماره همراه"
            name="phoneNumber"
            type="number"
          />
          <div className="col-span-6">
            <Controller
              name="genderId"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  name="genderId"
                  errors={errors}
                  label="جنسیت"
                  options={genderOptions}
                  placeholder="جنسیت..."
                  onChange={(selected) => {
                    field.onChange(selected ? selected.value : "");
                  }}
                  onBlur={field.onBlur}
                  value={
                    genderOptions.find(
                      (option) => option.value === field.value,
                    ) || null
                  }
                />
              )}
            />
          </div>
          <FormInput
            register={register}
            errors={errors}
            className="col-span-6"
            label="کد پستی"
            name="postalCode"
            type="number"
          />

          <TextArea
            register={register}
            errors={errors}
            className="col-span-7"
            label="آدرس"
            name="homeAddress"
          />
          <TextArea
            register={register}
            errors={errors}
            className="col-span-7"
            label="بیوگرافی"
            name="bio"
          />
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

export default PersonalInformation;
