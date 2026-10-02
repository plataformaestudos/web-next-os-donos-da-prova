import { NewPlanModel } from "@/model/plan.model";
import SignupSteps from "@/signup/signup.component";
import HttpClient from "@/util/http-client/fetch-server.util";
import { ResponseModel } from "@/model/common.model";

export default async function SignupPage() {
  const response = await HttpClient.fetch<ResponseModel<NewPlanModel[]>>("/public/plans", { cache: "no-store" });
  return <SignupSteps plans={response.data} />;
}
