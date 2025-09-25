// NewQuestionPage.tsx (Server Component)
import { NewQuestionPageClient } from "./pageClient";
import HttpClient from "@/util/http-client/fetch-server.util";
import { ResponseModel } from "@/model/common.model";
import { ModuleEntitie } from "@/model/module.model";

type SearchParams = Promise<{ modulo?: string }>

export default async function NewQuestionPage(props: { searchParams: SearchParams }) {
    const { modulo } = await props.searchParams;
    const moduleParam = modulo;

    const urlBack = moduleParam ? `/questions/module/${moduleParam}` : "/questions";

    let defaultSelectedModule: ModuleEntitie | undefined = undefined;

    if (moduleParam) {
        const response = await HttpClient.fetch<ResponseModel<ModuleEntitie>>(
            `/modules/${moduleParam}`,
            {
                method: "GET"
            },

        );
        defaultSelectedModule = response.data;
    }

    return <NewQuestionPageClient defaultSelectedModule={defaultSelectedModule} urlBack={urlBack} />;
}
