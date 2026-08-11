-- Ensure retries also respect an already-open provider circuit.
drop trigger if exists trg_notification_job_circuit on notification_jobs;
create trigger trg_notification_job_circuit before insert or update on notification_jobs for each row execute function pmmi_prevent_delivery_during_open_circuit();
