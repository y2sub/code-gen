<script lang="ts">
	let isMenuOpen = false;
	function openMenu() {
		isMenuOpen = !isMenuOpen;
	}
</script>

<button
	type="button"
	on:click={openMenu}
	class="text-xl py-1.5 px-3 my-auto
        bg-white hover:bg-slate-950
        text-slate-950 hover:text-slate-50 rounded-md
        transition-all ease-in-out duration-300
        "
>
	<i class="bi bi-list"></i>
</button>
