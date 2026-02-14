"use client";
import Btn from "@/common/Btn";
import Title from "@/common/Title";
import DateInput from "@/components/DateInput";
import FormInput from "@/components/FormInput";
import ImageUploader from "@/components/Profile/ImageUploader";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { PiNotepadDuotone } from "react-icons/pi";
import { Controller, useForm } from "react-hook-form";
import { useGetUserData, useUpdateUser } from "@/hooks/userHooks";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

const defaultValues = {
  title: "",
  startDate: "",
  endDate: "",
};

const schema = yup.object({
  title: yup
    .string()
    .required("عنوان الزامی است")
    .min(2, "عنوان باید حداقل 2 کاراکتر باشد")
    .max(100, "عنوان نمی‌تواند بیشتر از 100 کاراکتر باشد"),
  startDate: yup
    .string()
    .required("تاریخ شروع الزامی است")
    .matches(/^\d{4}-\d{2}-\d{2}$/, "فرمت تاریخ باید YYYY-MM-DD باشد"),
  endDate: yup
    .string()
    .required("تاریخ پایان الزامی است")
    .matches(/^\d{4}-\d{2}-\d{2}$/, "فرمت تاریخ باید YYYY-MM-DD باشد"),
});

const AddEducation = () => {
  const router = useRouter();
  const { mutateAsync } = useUpdateUser();
  const { completeUser, completeUserLoading } = useGetUserData("educationDegrees");
  console.log(completeUser)
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

  const updateHandler = async (data) => {
    try {
      const res = await mutateAsync({
        id: completeUser.data.id,
        data: {
          educationDegrees: [...completeUser.data.educationDegrees, data],
        },
      });
      queryClient.invalidateQueries({
        queryKey : ["complete-user" , completeUser.data.id , "educationDegrees"]
      });
      reset();
      router.push("/profile/education")
    } catch (err) {
      console.log(err);
    }
  };

  if (completeUserLoading) return <div>loading ...</div>;
  return (
    <section>
      <Title
        text="افزودن مدرک تحصیلی"
        icon={<PiNotepadDuotone className="text-secondary text-3xl" />}
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
          <div className="col-span-9 my-5">
            <ImageUploader />
          </div>
          <div className="col-span-9">
            <Btn text="افزودن" type="submit" />
          </div>
        </form>
      </article>
    </section>
  );
};

export default AddEducation;
