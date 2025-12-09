<script lang="ts">
  import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "$lib/components/ui/card/index.js";
  import { Label } from "$lib/components/ui/label/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import { Alert, AlertTitle, AlertDescription } from "$lib/components/ui/alert/index.js";
  let { form, data } = $props();
</script>

<section class="mx-auto max-w-7xl px-6 py-12 sm:py-16">
  <div class="mx-auto max-w-md">
    <Card class="rounded-2xl">
      <CardHeader>
        <CardTitle>{data?.content?.login?.title || "Log in"}</CardTitle>
        <CardDescription>{data?.content?.login?.description || "Access your Medlink account."}</CardDescription>
      </CardHeader>
      <form method="POST" action="/login" class="contents">
        <CardContent class="space-y-4">
          <div class="space-y-2">
            <Label for="email">{data?.content?.login?.emailLabel || "Email"}</Label>
            <Input id="email" name="email" type="email" placeholder={data?.content?.login?.emailPlaceholder || "you@example.com"} class="h-10" value={(form as any)?.values?.email} />
          </div>
          <div class="space-y-2">
            <Label for="password">{data?.content?.login?.passwordLabel || "Password"}</Label>
            <Input id="password" name="password" type="password" placeholder={data?.content?.login?.passwordPlaceholder || "••••••••"} class="h-10" />
          </div>
          <div class="flex items-center justify-between text-xs">
            <a href="/reset" class="underline">{data?.content?.login?.forgotPassword || "Forgot password?"}</a>
          </div>
        </CardContent>
        <CardFooter class="flex flex-col gap-3">
          <Button type="submit" class="w-full">{data?.content?.login?.loginButton || "Log in"}</Button>
          <p class="text-xs text-muted-foreground">{data?.content?.login?.newUser || "New to Medlink?"}
            <a href="/signup" class="font-medium text-primary underline-offset-4 hover:underline">{data?.content?.login?.createAccount || "Create an account"}</a>
          </p>
          {#if (form as any)?.error}
            <Alert variant="destructive" class="mb-4 border-none">
                <AlertTitle>{data?.content?.login?.loginFailed || "Login failed"}</AlertTitle>
                <AlertDescription>{(form as any)?.error || (data?.content?.login?.loginFailedMessage || "Check your email and password.")}</AlertDescription>
            </Alert>
          {/if}
        </CardFooter>
      </form>
    </Card>
  </div>
</section>
