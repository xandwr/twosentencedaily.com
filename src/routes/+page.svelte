<script lang="ts">
    let sentence1 = $state('');
    let sentence2 = $state('');
</script>

<div
    class="bg-blue-300 w-screen h-screen flex flex-col items-center justify-between gap-y-8 max-w-3xl m-auto p-8"
>
    <div class="text-4xl bg-blue-400 w-full p-4 text-center">
        <h3 class="text-sm">THE</h3>
        <h1>Two-Sentence Daily</h1>
    </div>

    <div class="w-full flex flex-col gap-y-4 items-center">
        <div class="text-center bg-blue-500 p-4 w-full">
            <h2>Write a two-sentence [type] story about:</h2>
            <ul class="flex gap-x-16 font-semibold justify-center">
                <li>Keyword 1</li>
                <li>Keyword 2</li>
                <li>Keyword 3</li>
            </ul>
        </div>

        <div class="flex flex-col gap-y-2 w-full p-8 bg-blue-400">
            <div class="w-full">
                <h1 class="text-center font-bold">Sentence 1:</h1>
                <input class="border w-full" maxlength={150} bind:value={sentence1} />
                <p class="text-right text-xs opacity-60">{sentence1.length}/150</p>
            </div>

            <div class="w-full">
                <h1 class="text-center font-bold">Sentence 2:</h1>
                <input class="border w-full" maxlength={150} bind:value={sentence2} />
                <p class="text-right text-xs opacity-60">{sentence2.length}/150</p>
            </div>
        </div>

        <div>
            <button class="border rounded-xl text-xl p-2 bg-blue-500 font-bold hover:bg-blue-300 transition-colors">Submit</button>
        </div>
    </div>

    <div class="bg-blue-400 w-full text-center p-4">
        <h1><a href="https://github.com/xandwr">@xandwr</a> 2026</h1>
    </div>
</div>
