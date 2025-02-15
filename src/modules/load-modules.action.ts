"use server";

import { ModuleModel, ModuleViewModel } from "@/model/module.model";

import HttpClient from "@/util/http-client/fetch-server.util";
import { ResponseModel } from "@/model/common.model";
import { createClient } from "@/util/supabase/server";

function adapter(module: ModuleModel): ModuleViewModel {
  return {
    ...module,
    key: module.id,
    title: module.name,
  };
}

export async function loadRootModules() {
  return HttpClient.fetch<ResponseModel<ModuleModel[]>>(
    "/modules/root-modules",
    {
      method: "GET",
    }
  ).then((response) => response.data.map(adapter));
}

export async function loadChildrenModules(moduleId: string) {
  return HttpClient.fetch<ResponseModel<ModuleModel[]>>(
    `/modules/${moduleId}/child-modules`,
    {
      method: "GET",
    }
  ).then((response) => response.data.map(adapter));
}

export async function queryModules(query: string) {
  const supabase = await createClient();

  return supabase
    .from("modules")
    .select()
    .ilike("name", `%${query.toLowerCase()}%`);
}
