"use server";

import { CACHE_TAGS } from "@/util/cache-tags.util";
import HttpClient from "@/util/http-client/fetch-server.util";
import { ModuleModel, ModuleViewModel } from "@/model/module.model";
import { ResponseModel } from "@/model/common.model";
import { moduleModelToViewModelAdapter } from "../modules.util";

export async function loadChildrenModules(moduleId: string): Promise<ModuleViewModel[]> {
  try {
    const res = await HttpClient.fetch<{ data: ModuleModel[]; error?: string }>(
      `/modules/${moduleId}/child-modules`,
      {
        method: "GET",
        next: {
          tags: [CACHE_TAGS.CHILD_MODULES],
        },
      }
    );

    if (!res.data) {
      console.warn(`Nenhum dado retornado para módulos filhos do módulo ${moduleId}`);
      return [];
    }
    
    return res.data
      .map(moduleModelToViewModelAdapter)
      .map((mod) => ({
        ...mod,
        parentModuleId: moduleId,
      }));

  } catch (error: unknown) {
    console.error("Erro ao carregar módulos filhos", error);
    // Retorna array vazio em caso de erro, para não disparar error.tsx
    return [];
  }
}

export async function queryModules(query?: string, parentModuleId?: string) {
  let $queryPromise: Promise<ResponseModel<ModuleModel[]>>;
  if (!query) {
    $queryPromise = HttpClient.fetch<ResponseModel<ModuleModel[]>>(
      "/modules/root-modules",
      {
        method: "GET",
        next: {
          tags: [CACHE_TAGS.ROOT_MODULES],
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

export async function loadUserPlanModules() {
  try {
    const res = await HttpClient.fetch<ResponseModel<ModuleModel[]>>(
      `/modules/plans/user`,
      {
        method: "GET",
        next: {
          tags: [CACHE_TAGS.MODULES],
        },
      }
    );
    if (!res.data) {
      console.warn("Nenhum dado retornado para módulos do plano do usuário");
      return [];
    }
    
    return res.data.map(moduleModelToViewModelAdapter);

  } catch (error: unknown) {
    console.error("Erro ao carregar módulos do plano do usuário", error);
    return [];
  }
}
