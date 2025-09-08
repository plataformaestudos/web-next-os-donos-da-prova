"use server";

import { CACHE_TAGS } from "@/util/cache-tags.util";
import HttpClient from "@/util/http-client/fetch-server.util";
import { ModuleModel } from "@/model/module.model";
import { ResponseModel } from "@/model/common.model";
import { moduleModelToViewModelAdapter } from "../modules.util";

export async function loadChildrenModules(moduleId: string) {
  return HttpClient.fetch<ResponseModel<ModuleModel[]>>(
    `/user-modules/stats/${moduleId}/child-modules`,
    {
      method: "GET",
      next: {
        tags: [CACHE_TAGS.MODULES],
      },
    }
  ).then((response) => {
    return response.data
      .map(moduleModelToViewModelAdapter)
      .map((mod) => ({ ...mod, parentModuleId: moduleId }));
  });
}

export async function queryModules(query?: string, parentModuleId?: string) {
  let $queryPromise: Promise<ResponseModel<ModuleModel[]>>;
  if (!query) {
    $queryPromise = HttpClient.fetch<ResponseModel<ModuleModel[]>>(
      "/user-modules/stats",
      {
        method: "GET",
        next: {
          tags: [CACHE_TAGS.MODULES],
        },
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
        next: {
          tags: [CACHE_TAGS.MODULES],
        },
      }
    );
  }
  return $queryPromise.then((response) =>
    response.data.map(moduleModelToViewModelAdapter)
  );
}
