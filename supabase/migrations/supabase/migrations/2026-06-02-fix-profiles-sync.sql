-- Sync existing auth users into profiles

insert into public.profiles (id, email)
select id, email
from auth.users
where id not in (
  select id from public.profiles
);

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', '')
  )
  on conflict (id) do nothing;

  return new;
end;
$$ language plpgsql security definer;