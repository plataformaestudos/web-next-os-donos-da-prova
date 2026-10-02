// EditModulePage.tsx (Server Component)
import { loadChildrenModules } from "@/modules/tree/load-modules.action";
import { EditModulePageClient } from "./pageClient";
import HttpClient from "@/util/http-client/fetch-server.util";
import { ModuleEntitie } from "@/model/module.model";
import { CACHE_TAGS } from "@/util/cache-tags.util";
import { ResponseModel } from "@/model/common.model";
import { FullPageLoading } from "@/ui/loading/full-page-loading";
type Params = Promise<{ id: string }>


export default async function EditModulePage(props: { params: Params }) {
    const params = await props.params;
    const { id } = params;

    const response = await HttpClient.fetch<ResponseModel<ModuleEntitie>>(`/modules/${encodeURIComponent(id)}`, { cache: "no-store" });
    const data = response.data ? {
        id: response.data.id, name: response.data.name,
        parent_module_id: response.data.parentModuleId,
    } : null;

    if (!data) return null;
    const allModulesResponse = await HttpClient.fetch<ResponseModel<ModuleEntitie[]>>(
        `/modules/all`,
        {
            method: "GET",
            next: {
                tags: [CACHE_TAGS.MODULES],
            },
        },

    );
    if (allModulesResponse.data == null) {
        return <FullPageLoading />;
    }
    const allModules = allModulesResponse.data.filter((m) => m.id !== id);

    const childrenModules = await loadChildrenModules(data.id);

    return <EditModulePageClient module={data} childrenModules={childrenModules || []} allModules={allModules || []} />;
}
