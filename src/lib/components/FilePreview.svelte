<script lang="ts">
  export let filePath: string;
  export let fileType: string;
  export let bucket: 'steps' | 'instructions' | 'assets' = 'steps';

  const BASE_URL = "https://pjttyefgwfimenfozyui.supabase.co/storage/v1/object/public/crud";
  
  const isImage = (path: string) => /\.(jpg|jpeg|png|gif|webp|jfif|bmp|tiff|svg|avif)$/i.test(path);
  const isPDF = (path: string) => /\.pdf$/i.test(path);
  const isVideo = (path: string) => /\.(mp4|webm|ogg|mov|avi|wmv)$/i.test(path);

  const getFullUrl = (path: string) => `${BASE_URL}/${bucket}/${path.replace(/^\//, '')}`;

  const getFileName = (path: string) => path.split('/').pop();
</script>

<div class="max-w-xs">
  <a href={getFullUrl(filePath)} target="_blank" class="cursor-pointer hover:opacity-80">
    {#if isImage(filePath)}
      <img 
        src={getFullUrl(filePath)} 
        alt="Preview" 
        class="max-h-24 w-auto object-contain rounded-md" 
      />
    {:else if isPDF(filePath)}
      <div class="flex items-center gap-2 text-blue-600">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
        <span>View PDF</span>
      </div>
    {:else if isVideo(filePath)}
      <video 
        controls 
        class="max-h-24 w-auto rounded-md"
      >
        <source src={getFullUrl(filePath)} type={`video/${fileType}`}>
        Your browser does not support the video tag.
      </video>
    {/if}
  </a>
</div> 