<script lang="ts">
  import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "$lib/components/ui/card/index.js";
  import { Label } from "$lib/components/ui/label/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import { Alert, AlertTitle, AlertDescription } from "$lib/components/ui/alert/index.js";
  let { form } = $props();
</script>

<section class="mx-auto max-w-7xl px-6 py-12 sm:py-16">
  <div class="mx-auto max-w-md">
    <Card class="rounded-2xl">
      <CardHeader>
        <CardTitle>Set a new password</CardTitle>
        <CardDescription>Choose a strong password to secure your account.</CardDescription>
      </CardHeader>
      <form method="POST" class="contents">
        <CardContent class="space-y-4">
          <div class="space-y-2">
            <Label for="password">New password</Label>
            <Input id="password" name="password" type="password" placeholder="••••••••" class="h-10" />
          </div>
          <div class="space-y-2">
            <Label for="confirm">Confirm password</Label>
            <Input id="confirm" name="confirm" type="password" placeholder="••••••••" class="h-10" />
          </div>
        </CardContent>
        <CardFooter class="flex flex-col gap-3">
            <Button type="submit" class="w-full">Update password</Button>
            {#if (form as any)?.error}
                <Alert variant="destructive" class="mb-4 border-none">
                    <AlertTitle>Reset failed</AlertTitle>
                    <AlertDescription>{(form as any).error}</AlertDescription>
                </Alert>
            {/if}
            {#if (form as any)?.success}
                <Alert class="mb-4 border-none">
                    <AlertTitle>Password updated</AlertTitle>
                    <AlertDescription>{(form as any).success}</AlertDescription>
                </Alert>
            {/if}
        </CardFooter>
      </form>
    </Card>
  </div>
</section>
