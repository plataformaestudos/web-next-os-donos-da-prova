"use server";

import { ModuleModel, ModuleViewModel } from "@/model/module.model";

import HttpClient from "@/util/http-client/fetch-server.util";
import { ResponseModel } from "@/model/common.model";

function extractOriginalId(idWithPipes: string) {
  const ids = idWithPipes.split("|");
  return ids.pop();
}

function adapter(module: ModuleModel): ModuleViewModel {
  return {
    ...module,
    key: module.id,
    title: module.name,
  };
}

export async function loadChildrenModules(moduleId: string) {
  return HttpClient.fetch<ResponseModel<ModuleModel[]>>(
    `/modules/${extractOriginalId(moduleId)}/child-modules`,
    {
      method: "GET",
    }
  ).then((response) => {
    return response.data
      .map(adapter)
      .map((mod) => ({ ...mod, parentModuleId: moduleId }));
  });
}

export async function queryModules(query: string, parentModuleId?: string) {
  let $queryPromise: Promise<ResponseModel<ModuleModel[]>>;
  if (!query) {
    $queryPromise = HttpClient.fetch<ResponseModel<ModuleModel[]>>(
      "/modules/root-modules",
      {
        method: "GET",
      }
    );
  } else {
    const queryParams = new URLSearchParams();
    queryParams.set("query", query);
    if (parentModuleId) {
      queryParams.set("parentModuleId", parentModuleId);
    }
    $queryPromise = HttpClient.fetch<ResponseModel<ModuleModel[]>>(
      `/modules?${queryParams.toString()}`,
      {
        method: "GET",
      }
    );
  }
  return $queryPromise.then((response) => response.data.map(adapter));
}
