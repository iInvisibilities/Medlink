<script lang="ts">
  import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "$lib/components/ui/card/index.js";
  import { Label } from "$lib/components/ui/label/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import { Alert, AlertTitle, AlertDescription } from "$lib/components/ui/alert/index.js";

  let { data, form } = $props();
</script>

<section class="mx-auto max-w-5xl px-4 sm:px-6 py-10 sm:py-16 space-y-8">
  <header class="space-y-2">
    <h1 class="text-3xl font-semibold tracking-tight">{(data as any)?.content?.account?.title || "Account settings"}</h1>
    <p class="text-sm text-muted-foreground">{(data as any)?.content?.account?.subtitle || "Manage your personal information and security."}</p>
  </header>

  <div class="grid gap-6 lg:gap-8 md:grid-cols-2">
    <!-- Profile (name, phone) -->
    <Card class="rounded-2xl">
      <CardHeader>
        <CardTitle>{(data as any)?.content?.account?.profileSectionTitle || "Profile"}</CardTitle>
        <CardDescription>{(data as any)?.content?.account?.profileSectionDescription || "Update your name and phone number."}</CardDescription>
      </CardHeader>
      <form method="POST" action="?/profile" class="contents">
        <CardContent class="space-y-4">
          <div class="space-y-2">
            <Label for="name">{(data as any)?.content?.account?.nameLabel || "Full name"}</Label>
            <Input
              id="name"
              name="name"
              class="h-10"
              value={(form as any)?.section === "profile" ? (form as any)?.values?.name : data.user.name}
              aria-invalid={Boolean((form as any)?.section === "profile" && (form as any)?.errors?.name)}
              aria-errormessage="account-name-error"
            />
            {#if (form as any)?.section === "profile" && (form as any)?.errors?.name}
              <p id="account-name-error" class="text-xs text-destructive">{(form as any).errors.name}</p>
            {/if}
          </div>
          <div class="space-y-2">
            <Label for="phone">{(data as any)?.content?.account?.phoneLabel || "Phone number"}</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              class="h-10"
              value={(form as any)?.section === "profile" ? (form as any)?.values?.phone : data.user.phone}
              aria-invalid={Boolean((form as any)?.section === "profile" && (form as any)?.errors?.phone)}
              aria-errormessage="account-phone-error"
            />
            {#if (form as any)?.section === "profile" && (form as any)?.errors?.phone}
              <p id="account-phone-error" class="text-xs text-destructive">{(form as any).errors.phone}</p>
            {/if}
          </div>
          <div class="space-y-2">
            <Label>{(data as any)?.content?.account?.emailLabel || "Email"}</Label>
            <Input value={data.user.email} disabled class="h-10 opacity-80" />
          </div>
        </CardContent>
        <CardFooter class="flex flex-col gap-2 items-start">
          <Button type="submit" class="w-full md:w-auto">{(data as any)?.content?.account?.saveProfileButton || "Save changes"}</Button>
          {#if (form as any)?.section === "profile" && (form as any)?.success}
            <p class="text-xs text-muted-foreground">{(data as any)?.content?.account?.profileUpdated || "Profile updated."}</p>
          {/if}
        </CardFooter>
      </form>
    </Card>

    <!-- Change password -->
    <Card class="rounded-2xl">
      <CardHeader>
        <CardTitle>{(data as any)?.content?.account?.passwordSectionTitle || "Change password"}</CardTitle>
        <CardDescription>{(data as any)?.content?.account?.passwordSectionDescription || "Set a new password for your account."}</CardDescription>
      </CardHeader>
      <form method="POST" action="?/password" class="contents">
        <CardContent class="space-y-4">
          <div class="space-y-2">
            <Label for="current_password">{(data as any)?.content?.account?.currentPasswordLabel || "Current password"}</Label>
            <Input
              id="current_password"
              name="current_password"
              type="password"
              class="h-10"
              aria-invalid={Boolean((form as any)?.section === "password" && (form as any)?.errors?.current_password)}
              aria-errormessage="account-current-password-error"
            />
            {#if (form as any)?.section === "password" && (form as any)?.errors?.current_password}
              <p id="account-current-password-error" class="text-xs text-destructive">{(form as any).errors.current_password}</p>
            {/if}
          </div>
          <div class="space-y-2">
            <Label for="new_password">{(data as any)?.content?.account?.newPasswordLabel || "New password"}</Label>
            <Input
              id="new_password"
              name="new_password"
              type="password"
              class="h-10"
              aria-invalid={Boolean((form as any)?.section === "password" && (form as any)?.errors?.new_password)}
              aria-errormessage="account-new-password-error"
            />
            {#if (form as any)?.section === "password" && (form as any)?.errors?.new_password}
              <p id="account-new-password-error" class="text-xs text-destructive">{(form as any).errors.new_password}</p>
            {/if}
          </div>
          <div class="space-y-2">
            <Label for="confirm_password">{(data as any)?.content?.account?.confirmPasswordLabel || "Confirm new password"}</Label>
            <Input
              id="confirm_password"
              name="confirm_password"
              type="password"
              class="h-10"
              aria-invalid={Boolean((form as any)?.section === "password" && (form as any)?.errors?.confirm_password)}
              aria-errormessage="account-confirm-password-error"
            />
            {#if (form as any)?.section === "password" && (form as any)?.errors?.confirm_password}
              <p id="account-confirm-password-error" class="text-xs text-destructive">{(form as any).errors.confirm_password}</p>
            {/if}
          </div>
        </CardContent>
        <CardFooter class="flex flex-col gap-2 items-start">
          <Button type="submit" class="w-full md:w-auto">{(data as any)?.content?.account?.changePasswordButton || "Update password"}</Button>
          {#if (form as any)?.section === "password" && (form as any)?.success}
            <p class="text-xs text-muted-foreground">{(data as any)?.content?.account?.passwordUpdated || "Password updated."}</p>
          {/if}
        </CardFooter>
      </form>
    </Card>
  </div>

  <!-- Delete account -->
  <Card class="border-destructive/40 bg-destructive/5 rounded-2xl">
    <CardHeader>
      <CardTitle class="text-destructive">{(data as any)?.content?.account?.deleteSectionTitle || "Delete account"}</CardTitle>
      <CardDescription>{(data as any)?.content?.account?.deleteSectionDescription || "This will permanently delete your account and sign you out."}</CardDescription>
    </CardHeader>
    <form method="POST" action="?/delete" class="contents">
      <CardContent class="space-y-4">
        <Alert variant="destructive" class="border-none bg-destructive/10">
          <AlertTitle>{(data as any)?.content?.account?.deleteWarningTitle || "Danger"}</AlertTitle>
          <AlertDescription>{(data as any)?.content?.account?.deleteWarning || "This action cannot be undone."}</AlertDescription>
        </Alert>
        <div class="space-y-2">
          <Label for="confirm">{(data as any)?.content?.account?.deleteConfirmLabel || "Type DELETE to confirm"}</Label>
          <Input
            id="confirm"
            name="confirm"
            class="h-10"
            placeholder={(data as any)?.content?.account?.deletePlaceholder || "DELETE"}
            aria-invalid={Boolean((form as any)?.section === "delete" && (form as any)?.errors?.confirm)}
            aria-errormessage="account-delete-confirm-error"
          />
          {#if (form as any)?.section === "delete" && (form as any)?.errors?.confirm}
            <p id="account-delete-confirm-error" class="text-xs text-destructive">{(form as any).errors.confirm}</p>
          {/if}
        </div>
      </CardContent>
      <CardFooter>
        <Button type="submit" variant="destructive">{(data as any)?.content?.account?.deleteButton || "Delete account"}</Button>
      </CardFooter>
    </form>
  </Card>
</section>
