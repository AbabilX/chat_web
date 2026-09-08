export type GhAppInstallation = {
  id: number;
  account_login: string;
  account_type: string;
  installed_at: string;
};

export type GhAppEvent = {
  id: number;
  installation_id: number;
  event: string;
  action: string;
  repo_full_name: string;
  pr_number: number;
  delivery_id: string;
  created_at: string;
};
