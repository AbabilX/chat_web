"use client";

import { useCallback, useEffect, useState } from "react";
import { api, type Repo } from "@/lib/api";
import { useTeamContext } from "./team-provider";

export function useTeamData() {
  const { detail, loading, error, reload } = useTeamContext();
  const [repos, setRepos] = useState<Repo[]>([]);
  const [limits, setLimits] = useState({
    max_repos: 1,
    max_branches_per_repo: 3,
  });

  useEffect(() => {
    api
      .getDigestConfig()
      .then((digestCfg) => {
        if (digestCfg?.limits) {
          setLimits({
            max_repos: digestCfg.limits.max_repos,
            max_branches_per_repo: digestCfg.limits.max_branches_per_repo,
          });
        }
      })
      .catch(() => {});
  }, []);

  const loadRepos = useCallback(async () => {
    try {
      const list = await api.getRepos();
      setRepos(list);
    } catch {
      setRepos([]);
    }
  }, []);

  return {
    detail,
    repos,
    limits,
    loading,
    error,
    reload,
    loadRepos,
  };
}
