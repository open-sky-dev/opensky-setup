<script lang="ts">
	import { page } from '$app/state'
</script>

<div
	class="flex min-h-screen w-full flex-col items-center justify-center gap-2 bg-neutral-100 dark:bg-neutral-800"
>
	<h1 class="text-4xl font-medium dark:text-white">{page.status}</h1>
	<h2 class="text-lg text-neutral-700 dark:text-neutral-200">
		{page.error?.message || 'Something went wrong'}
	</h2>
</div>
