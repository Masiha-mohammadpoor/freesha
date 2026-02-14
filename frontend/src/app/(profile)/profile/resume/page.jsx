"use client";
import Btn from "@/common/Btn";
import Title from "@/common/Title";
import LanguagesSelector from "@/components/Profile/LanguagesSelector";
import ResumeUploader from "@/components/Profile/ResumeUploader";
import SkillsSelector from "@/components/Profile/SkillsSelector";
import { useGetUserData, useUpdateUser } from "@/hooks/userHooks";
import { yupResolver } from "@hookform/resolvers/yup";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { PiFilesDuotone } from "react-icons/pi";
import * as yup from "yup";

const schema = yup.object({
  skills: yup.array().of(yup.string()).default([]).optional(),
  languageNames: yup.array().of(yup.string()).default([]).optional(),
});

const Resume = () => {
  const { mutateAsync } = useUpdateUser();
  const { completeUser, completeUserLoading } = useGetUserData(
    "skills,languageNames",
  );
  const queryClient = useQueryClient();

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors, isValid, isDirty, isSubmitting },
  } = useForm({
    defaultValues: {
      skills: [],
      languageNames: [],
    },
    resolver: yupResolver(schema),
    mode: "onTouched",
  });

  useEffect(() => {
    if (completeUser && !completeUserLoading) {
      const { skills, languageNames } = completeUser.data;
      reset({ skills, languageNames });
    }
  }, [reset, completeUser, completeUserLoading]);

  const updateHandler = async (data) => {
    try {
      const res = await mutateAsync({ id: completeUser.data.id, data });
      reset();
      queryClient.invalidateQueries({
        queryKey: [
          "complete-user",
          completeUser.data.id,
          "skills,languageNames",
        ],
      });
    } catch (err) {
      console.log(err);
    }
  };

  if (completeUserLoading) return <p>loading...</p>;
  if (completeUser && !completeUserLoading)
    return (
      <section>
        <Title
          text="رزومه کاری"
          icon={<PiFilesDuotone className="text-secondary text-3xl" />}
          color="primary"
        />
        <article className="mt-16">
          <form
            onSubmit={handleSubmit(updateHandler)}
            className="flex flex-col gap-y-10"
          >
            <div className="w-[50%]">
              <SkillsSelector
                control={control}
                initialSkills={completeUser.data.skills}
              />
            </div>
            <LanguagesSelector
              control={control}
              initialLanguages={completeUser.data.languageNames}
            />
            <ResumeUploader />
            <div>
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

export default Resume;
