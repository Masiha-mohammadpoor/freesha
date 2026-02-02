import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";
import { and, eq, sql } from "drizzle-orm";
import { Pool } from "pg";

import {
  gendersTable,
  jobPostsTable,
  rolesTable,
  userEducationDegreesTable,
  userLanguagesTable,
  userPortfoliosTable,
  userSkillsTable,
  userSocialLinksTable,
  usersTable,
  userWorkExperiencesTable,
} from "./schema.js";
import { customLog, isNone } from "../helpers/utils.js";
import {
  DbError,
  DbResponse,
  DbResult,
  EducationDegree,
  JobPost,
  None,
  Portfolio,
  PreRegisterInfo,
  Transaction,
  User,
  WorkExperience,
} from "../helpers/types.js";
import {
  educationDegreesQuery,
  languageNamesQuery,
  portfoliosQuery,
  skillsQuery,
  socialLinksQuery,
  workExperiencesQuery,
} from "./queries.js";
import { fixDatabaseUrl } from "../helpers/utils_indep.js";

export const defaultFields = [
  // "id" and "roleName" are hard-coded
  "name",
  "email",
  "createdAt",
  "updatedAt",
  "lastLoginAt",
];

export let db: NodePgDatabase<Record<string, never>> & {
  $client: Pool;
};

export function connectDb() {
  if (isNone(process.env.DATABASE_URL)) {
    customLog("database", "Database URL is empty, check the .env file");
    customLog("server", "Exiting due to no database connection");
    process.exit(1);
  }

  fixDatabaseUrl();

  db = drizzle(process.env.DATABASE_URL);

  customLog("database", "Connected via drizzle");
}

export async function disconnectDb() {
  await db.$client.end();

  customLog("database", "Connection closed");
}

function makeDbResponse<T>(result: T, error: DbError): DbResponse<T> {
  return { result, error };
}

export async function emailExists(
  email: string
): Promise<DbResponse<DbResult>> {
  try {
    const result = await db
      .select({
        email: usersTable.id,
      })
      .from(usersTable)
      .where(eq(usersTable.email, email));

    return makeDbResponse(result[0], null);
  } catch (error) {
    return makeDbResponse(null, error as Error);
  }
}

export async function insertUser(
  preRegisterInfo: PreRegisterInfo
): Promise<DbResponse<DbResult>> {
  try {
    const result = await db
      .insert(usersTable)
      .values({
        name: preRegisterInfo.name,
        email: preRegisterInfo.email,
        password: preRegisterInfo.hashedPassword,
        roleId: 1,
      })
      .returning({
        id: usersTable.id,
      });

    return makeDbResponse(result[0]?.id, null);
  } catch (error) {
    return makeDbResponse(null, error as Error);
  }
}

export async function updateLastLogin(
  id: number
): Promise<DbResponse<true | null>> {
  try {
    await db
      .update(usersTable)
      .set({
        lastLoginAt: sql`NOW()`,
      })
      .where(eq(usersTable.id, id));

    return makeDbResponse(true, null);
  } catch (error) {
    return makeDbResponse(null, error as Error);
  }
}

export async function getUser(
  idOrEmail: number,
  fields: string[],
  getPassword: boolean = false
): Promise<DbResponse<Partial<User> | None>> {
  const columns: any = {
    id: usersTable.id,
    roleName: rolesTable.roleName,
  };
  const all = fields.includes("all");

  let equality;
  if (typeof idOrEmail === "number") equality = eq(usersTable.id, idOrEmail);
  if (typeof idOrEmail === "string") equality = eq(usersTable.email, idOrEmail);

  if (all || fields.includes("name")) columns.name = usersTable.name;
  if (all || fields.includes("email")) columns.email = usersTable.email;
  if (getPassword && fields.includes("hashedPassword"))
    columns.hashedPassword = usersTable.password;

  if (all || fields.includes("skills")) columns.skills = skillsQuery;
  if (all || fields.includes("languageNames"))
    columns.languageNames = languageNamesQuery;
  if (all || fields.includes("socialLinks"))
    columns.socialLinks = socialLinksQuery;

  if (all || fields.includes("educationDegrees"))
    columns.educationDegrees = educationDegreesQuery;
  if (all || fields.includes("workExperiences"))
    columns.workExperiences = workExperiencesQuery;
  if (all || fields.includes("portfolios"))
    columns.portfolios = portfoliosQuery;

  if (all || fields.includes("phoneNumber"))
    columns.phoneNumber = usersTable.phoneNumber;
  if (all || fields.includes("postalCode"))
    columns.postalCode = usersTable.postalCode;
  if (all || fields.includes("homeAddress"))
    columns.homeAddress = usersTable.homeAddress;
  if (all || fields.includes("genderName"))
    columns.genderName = gendersTable.genderName;
  if (all || fields.includes("jobTitle"))
    columns.jobTitle = usersTable.jobTitle;
  if (all || fields.includes("bio")) columns.bio = usersTable.bio;
  if (all || fields.includes("birthDate"))
    columns.birthDate = usersTable.birthDate;
  if (all || fields.includes("createdAt"))
    columns.createdAt = usersTable.createdAt;
  if (all || fields.includes("updatedAt"))
    columns.updatedAt = usersTable.updatedAt;
  if (all || fields.includes("lastLoginAt"))
    columns.lastLoginAt = usersTable.lastLoginAt;

  try {
    const result = await db
      .select(columns)
      .from(usersTable)
      .innerJoin(rolesTable, eq(usersTable.roleId, rolesTable.id))
      .innerJoin(gendersTable, eq(usersTable.genderId, gendersTable.id))
      .where(equality);

    return makeDbResponse<User | None>(result[0] as unknown as User, null);
  } catch (error) {
    return makeDbResponse(null, error as Error);
  }
}

export async function updateUser(
  id: number,
  values: Partial<User>
): Promise<DbResponse<Partial<User> | None>> {
  try {
    const { skills, languageNames, socialLinks } = values;
    let { educationDegrees, workExperiences, portfolios } = values;

    delete values.skills;
    delete values.languageNames;
    delete values.socialLinks;
    delete values.educationDegrees;
    delete values.workExperiences;
    delete values.portfolios;

    educationDegrees = educationDegrees?.map(
      (value) => ((value.userId = id), value)
    );
    workExperiences = workExperiences?.map(
      (value) => ((value.userId = id), value)
    );
    portfolios = portfolios?.map((value) => ((value.userId = id), value));

    const result = await db.transaction(async (tx: Transaction) => {
      await tx
        .update(usersTable)
        .set({ ...values, updatedAt: sql`NOW()` })
        .where(eq(usersTable.id, id));

      await insertSkills(tx, id, skills);
      await insertLanguages(tx, id, languageNames);
      await insertSocialLinks(tx, id, socialLinks);
      await insertEducationDegrees(
        tx,
        id,
        educationDegrees as Required<EducationDegree>[]
      );
      await insertWorkExperiences(
        tx,
        id,
        workExperiences as Required<WorkExperience>[]
      );
      await insertPortfolios(tx, id, portfolios as Required<Portfolio>[]);

      const user = await tx
        .select({
          id: usersTable.id,
          name: usersTable.name,
          email: usersTable.email,
          roleName: rolesTable.roleName,

          skills: skillsQuery,
          languageNames: languageNamesQuery,
          socialLinks: socialLinksQuery,

          educationDegrees: educationDegreesQuery,
          workExperiences: workExperiencesQuery,
          portfolios: portfoliosQuery,

          phoneNumber: usersTable.phoneNumber,
          postalCode: usersTable.postalCode,
          homeAddress: usersTable.homeAddress,
          genderName: gendersTable.genderName,
          jobTitle: usersTable.jobTitle,
          bio: usersTable.bio,
          birthDate: usersTable.birthDate,
          createdAt: usersTable.createdAt,
          updatedAt: usersTable.updatedAt,
        })
        .from(usersTable)
        .innerJoin(rolesTable, eq(usersTable.roleId, rolesTable.id))
        .innerJoin(gendersTable, eq(usersTable.genderId, gendersTable.id))
        .where(eq(usersTable.id, id));

      return user[0];
    });

    return makeDbResponse(result, null);
  } catch (error) {
    return makeDbResponse(null, error as Error);
  }
}

async function insertSkills(
  tx: Transaction,
  id: number,
  skills: string[] | None
): Promise<void> {
  if (isNone(skills)) {
    return;
  }

  const skillsObjects = [];
  for (const skill of skills) {
    skillsObjects.push({ userId: id, skill: skill });
  }

  await tx.delete(userSkillsTable).where(eq(userSkillsTable.userId, id));

  if (skills.length === 0) {
    return;
  }

  await tx.insert(userSkillsTable).values(skillsObjects);
}

async function insertLanguages(
  tx: Transaction,
  id: number,
  languageNames: string[] | None
): Promise<void> {
  if (isNone(languageNames)) {
    return;
  }

  const userLanguages = [];
  for (const languageName of languageNames) {
    userLanguages.push({ userId: id, languageName: languageName });
  }

  await tx.delete(userLanguagesTable).where(eq(userLanguagesTable.userId, id));

  if (languageNames.length === 0) {
    return;
  }

  await tx.insert(userLanguagesTable).values(userLanguages);
}

async function insertSocialLinks(
  tx: Transaction,
  id: number,
  socialLinks: string[] | None
): Promise<void> {
  if (isNone(socialLinks)) {
    return;
  }

  const socialLinksObjects = [];
  for (const socialLink of socialLinks) {
    socialLinksObjects.push({ userId: id, link: socialLink });
  }

  await tx
    .delete(userSocialLinksTable)
    .where(eq(userSocialLinksTable.userId, id));

  if (socialLinks.length === 0) {
    return;
  }

  await tx.insert(userSocialLinksTable).values(socialLinksObjects);
}

async function insertEducationDegrees(
  tx: Transaction,
  id: number,
  educationDegrees: Required<EducationDegree>[] | None
): Promise<void> {
  if (isNone(educationDegrees)) {
    return;
  }

  await tx
    .delete(userEducationDegreesTable)
    .where(eq(userEducationDegreesTable.userId, id));

  if (educationDegrees.length === 0) {
    return;
  }

  await tx.insert(userEducationDegreesTable).values(educationDegrees);
}

async function insertWorkExperiences(
  tx: Transaction,
  id: number,
  workExperiences: Required<WorkExperience>[] | None
): Promise<void> {
  if (isNone(workExperiences)) {
    return;
  }

  await tx
    .delete(userWorkExperiencesTable)
    .where(eq(userWorkExperiencesTable.userId, id));

  if (workExperiences.length === 0) {
    return;
  }

  await tx.insert(userWorkExperiencesTable).values(workExperiences);
}

async function insertPortfolios(
  tx: Transaction,
  id: number,
  portfolios: Required<Portfolio>[] | None
): Promise<void> {
  if (isNone(portfolios)) {
    return;
  }

  await tx
    .delete(userPortfoliosTable)
    .where(eq(userPortfoliosTable.userId, id));

  if (portfolios.length === 0) {
    return;
  }

  await tx.insert(userPortfoliosTable).values(portfolios);
}

export async function insertJobPost(
  jobPost: JobPost
): Promise<DbResponse<DbResult>> {
  try {
    const result = await db.insert(jobPostsTable).values(jobPost).returning({
      id: jobPostsTable.id,
      createdAt: jobPostsTable.createdAt,
      updatedAt: jobPostsTable.updatedAt,
    });

    return makeDbResponse(result[0], null);
  } catch (error) {
    return makeDbResponse(null, error as Error);
  }
}

export async function getJobPost(
  filters: Partial<JobPost>
): Promise<DbResponse<JobPost | None>> {
  const equalities = [];
  let conditions;

  // Handling all of the filters
  if (!isNone(filters.id)) {
    equalities.push(eq(jobPostsTable.id, filters.id));
  }

  if (!isNone(filters.clientId)) {
    equalities.push(eq(jobPostsTable.clientId, filters.clientId));
  }

  // Applying filters on conditions
  for (const equality of equalities) {
    conditions = isNone(conditions) ? equality : and(conditions, equality);
  }

  try {
    const result = await db.select().from(jobPostsTable).where(conditions);
    return makeDbResponse<JobPost | None>(result[0], null);
  } catch (error) {
    return makeDbResponse(null, error as Error);
  }
}
