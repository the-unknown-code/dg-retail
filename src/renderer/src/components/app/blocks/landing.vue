<template>
  <main class="page-index">
    <div id="noise" />
    <div class="container layout-block">
      <div class="logo margin-small">
        <img src="/landing/images/logo.svg" alt="Logo" />
      </div>
      <div class="margin">
        <p class="p" v-html="$store.getLocale('landing_title')"></p>
      </div>
      <div class="">
        <img class="product" :src="activePlaylist?.image" />
      </div>
      <div>
        <p
          class="p info"
          v-html="$store.getLocale(`landing_product_${activeMood.toLocaleLowerCase()}`)"
        ></p>
      </div>
      <div class="">
        <svg
          width="41"
          height="32"
          viewBox="0 0 41 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M19.4853 20.8995C19.0948 20.509 19.0948 19.8758 19.4853 19.4853L28.6777 10.2929C29.0682 9.90237 29.7014 9.90237 30.0919 10.2929C30.4824 10.6834 30.4824 11.3166 30.0919 11.7071L20.8995 20.8995C20.509 21.29 19.8758 21.29 19.4853 20.8995Z"
            fill="white"
          />
          <path
            d="M20.8995 20.8995C21.29 20.509 21.29 19.8758 20.8995 19.4853L11.7071 10.2929C11.3166 9.90237 10.6834 9.90237 10.2929 10.2929C9.90237 10.6834 9.90237 11.3166 10.2929 11.7071L19.4853 20.8995C19.8758 21.29 20.509 21.29 20.8995 20.8995Z"
            fill="white"
          />
        </svg>
      </div>
      <div class="margin">
        <p
          class="p white"
          v-html="$store.getLocale(`landing_playlist_${activeMood.toLocaleLowerCase()}`)"
        ></p>
      </div>
      <div class="screen">
        <img :src="activeWallpaper" />
        <div class="social">
          <a class="icon" :href="activeWallpaper" download="wallpaper.png">
            <svg
              width="12"
              height="18"
              viewBox="0 0 12 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M10.75 8.75L5.75 13.75M5.75 13.75L0.75 8.75M5.75 13.75L5.75 0.75M10.75 16.75H0.75"
                stroke="white"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </a>
          <div class="icon" @click="share">
            <svg
              width="16"
              height="19"
              viewBox="0 0 16 19"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M10.75 3.75L7.75 0.75M7.75 0.75L4.75 3.75M7.75 0.75L7.75 12.75M11.75 7.75H12.75C13.8546 7.75 14.75 8.64543 14.75 9.75L14.75 15.75C14.75 16.8546 13.8546 17.75 12.75 17.75H2.75C1.64543 17.75 0.75 16.8546 0.75 15.75L0.75 9.75C0.75 8.64543 1.64543 7.75 2.75 7.75H3.75"
                stroke="white"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>
        </div>
      </div>

      <div class="discover-cta">
        <a :href="activePlaylist?.url" target="_blank">
          <btn :label="$store.getLocale('landing_discover')" />
        </a>
        <div class="icon" @click="restartApp">
          <svg
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M1.90039 0C2.39745 0 2.80078 0.403334 2.80078 0.900391V2.19336C2.80078 2.23281 2.82336 2.26906 2.85938 2.28516C2.89537 2.30123 2.93742 2.29386 2.9668 2.26758C4.62917 0.776961 6.75474 0.00247923 8.90039 0.000976562C8.92106 0.000976562 8.93964 0.00085395 8.95898 0.000976562C9.05962 0.00157019 9.16101 0.0047332 9.2627 0.00878906C9.31562 0.0109071 9.36624 0.0127222 9.41699 0.015625C9.5181 0.0214144 9.61985 0.0306014 9.72266 0.0400391C9.7679 0.0441769 9.80303 0.0464968 9.84375 0.0507812C9.94471 0.0614478 10.0462 0.0744907 10.1484 0.0888672C10.204 0.0966551 10.2478 0.101488 10.2979 0.109375C10.3822 0.122699 10.4654 0.139813 10.5527 0.15625C10.6184 0.168589 10.6773 0.177634 10.7383 0.19043C10.813 0.206137 10.8869 0.224872 10.9639 0.243164C11.0329 0.259567 11.0986 0.273856 11.1641 0.291016C11.2301 0.308335 11.2935 0.327586 11.3633 0.347656C11.4427 0.370491 11.5171 0.391356 11.5918 0.415039C11.6052 0.419275 11.6106 0.41949 11.6211 0.422852L11.9629 0.541016C11.9681 0.542964 11.9738 0.545174 11.9805 0.547852C11.9875 0.550683 11.996 0.55432 12.0049 0.557617C12.0639 0.579601 12.1201 0.603094 12.1826 0.62793C12.2571 0.657516 12.3275 0.683959 12.3975 0.713867C12.4669 0.743589 12.5351 0.775834 12.6064 0.808594C12.6725 0.838923 12.7373 0.868394 12.8008 0.899414L12.9639 0.982422C13.0437 1.02347 13.1221 1.06479 13.1992 1.10742C13.2441 1.13224 13.2887 1.15789 13.335 1.18457C13.417 1.23185 13.4982 1.27964 13.5781 1.3291C13.6234 1.35712 13.6685 1.38613 13.7148 1.41602C13.7965 1.46866 13.8771 1.52157 13.9561 1.57617C13.9964 1.6041 14.0349 1.63281 14.0771 1.66309C14.1555 1.7192 14.2332 1.77522 14.3086 1.83301C14.3197 1.84149 14.3308 1.85006 14.3408 1.85742C14.3512 1.86504 14.3604 1.87209 14.3691 1.87891C14.3804 1.88765 14.392 1.89704 14.4043 1.90723C14.4161 1.91702 14.4291 1.92789 14.4424 1.93848C14.5164 1.9975 14.59 2.05778 14.6621 2.11914C14.7029 2.15376 14.743 2.18922 14.7832 2.22461C14.8449 2.27903 14.906 2.33385 14.9658 2.38965L15.1416 2.55664L15.2451 2.66113L15.4541 2.87891C15.4834 2.91083 15.5124 2.94341 15.542 2.97656C15.6105 3.05316 15.6767 3.13141 15.7422 3.20996C15.7663 3.23896 15.7897 3.26828 15.8145 3.29883C15.8835 3.38394 15.9513 3.46974 16.0166 3.55664C16.0312 3.57603 16.0449 3.59405 16.0605 3.61523C16.1309 3.71049 16.1992 3.80595 16.2646 3.90234C16.2778 3.92174 16.2856 3.93331 16.3008 3.95605C16.3649 4.05205 16.4276 4.14874 16.4873 4.24609C16.512 4.28635 16.5349 4.32594 16.5605 4.36914C16.6101 4.45293 16.6583 4.53559 16.7041 4.61914C16.7388 4.68232 16.7708 4.7462 16.8057 4.81348L16.8896 4.97852C16.9281 5.05665 16.9655 5.13582 17.002 5.21582C17.0261 5.26906 17.0492 5.31983 17.0713 5.37109L17.1973 5.68066C17.2018 5.69227 17.2068 5.7047 17.2109 5.71484C17.2152 5.72533 17.2192 5.73496 17.2227 5.74414C17.266 5.85831 17.3067 5.97444 17.3457 6.0918C17.3495 6.10314 17.3531 6.11466 17.3564 6.12402C17.36 6.13381 17.3636 6.14238 17.3662 6.15039C17.4049 6.26964 17.4395 6.39087 17.4736 6.51367C17.479 6.53294 17.4819 6.54214 17.4863 6.55859C17.517 6.67125 17.5448 6.78519 17.5713 6.90039C17.5795 6.93625 17.5859 6.95873 17.5928 6.99023C17.6185 7.10771 17.641 7.22667 17.6621 7.34668C17.6637 7.35582 17.6655 7.36498 17.667 7.37207C17.6685 7.37943 17.6699 7.38514 17.6709 7.39062C17.6884 7.49306 17.7036 7.59713 17.7178 7.70215L17.7422 7.90039C17.7493 7.9637 17.756 8.02712 17.7617 8.09082C17.7696 8.17676 17.7758 8.26343 17.7812 8.35059C17.7849 8.40997 17.7886 8.46821 17.791 8.52637C17.7951 8.62172 17.7969 8.7178 17.7979 8.81445L17.7988 8.86133C17.7995 8.87599 17.8008 8.88863 17.8008 8.90039L17.7998 8.92578C17.7994 8.93507 17.7989 8.94688 17.7988 8.95898C17.7982 9.05811 17.7959 9.15763 17.792 9.25684C17.7899 9.31038 17.7872 9.36375 17.7842 9.41699C17.7784 9.51854 17.7701 9.62066 17.7607 9.72266C17.757 9.76338 17.7532 9.80316 17.749 9.84277C17.738 9.94684 17.7256 10.0513 17.7109 10.1553C17.7043 10.2025 17.6976 10.2483 17.6904 10.2939C17.6766 10.3816 17.6602 10.4692 17.6436 10.5576C17.6318 10.6198 17.6218 10.6791 17.6094 10.7383C17.594 10.8112 17.5762 10.8837 17.5586 10.958C17.5422 11.0274 17.5264 11.0958 17.5088 11.1631C17.4901 11.2344 17.4695 11.3056 17.4482 11.3789C17.4277 11.45 17.4081 11.5175 17.3867 11.585C17.367 11.6472 17.3457 11.7066 17.3232 11.7725C17.2961 11.8521 17.2705 11.9289 17.2422 12.0049C17.2239 12.0539 17.2053 12.0997 17.1846 12.1523C17.1496 12.2415 17.1142 12.3289 17.0771 12.415C17.0547 12.4672 17.0312 12.5197 17.0068 12.5732C16.9729 12.648 16.9394 12.721 16.9043 12.793L16.8105 12.9775C16.7717 13.0527 16.7326 13.1264 16.6924 13.1992C16.6732 13.2339 16.6543 13.2686 16.6348 13.3027C16.5819 13.3954 16.527 13.4871 16.4707 13.5781C16.4474 13.6157 16.4242 13.6533 16.4004 13.6904C16.343 13.7801 16.2841 13.8687 16.2236 13.9561C16.1969 13.9947 16.1692 14.0324 16.1406 14.0723C16.0803 14.1566 16.0189 14.2406 15.9561 14.3223C15.9488 14.3317 15.9418 14.3412 15.9365 14.3486C15.9308 14.3567 15.9262 14.3626 15.9219 14.3682C15.9163 14.3753 15.9107 14.3831 15.9023 14.3926C15.8947 14.4013 15.8844 14.412 15.875 14.4238L15.6758 14.668C15.6426 14.707 15.6084 14.7453 15.5742 14.7842C15.52 14.8456 15.4656 14.9063 15.4102 14.9658C15.3552 15.0249 15.3006 15.0831 15.2451 15.1396C15.211 15.1744 15.1763 15.209 15.1416 15.2432C15.069 15.3148 14.9957 15.3853 14.9209 15.4541C14.8907 15.4819 14.8605 15.5082 14.8281 15.5371C14.7441 15.6123 14.6592 15.6856 14.5732 15.7568C14.557 15.7703 14.5509 15.7758 14.5371 15.7871C14.4418 15.8653 14.3439 15.9404 14.2451 16.0146C14.2208 16.0329 14.1963 16.0516 14.1709 16.0703C14.0814 16.1362 13.9912 16.2 13.9004 16.2617L13.8076 16.3242C13.7193 16.3826 13.6324 16.4401 13.5439 16.4941C13.5068 16.5169 13.4715 16.5364 13.4307 16.5605C13.3468 16.6101 13.2642 16.6583 13.1807 16.7041L12.9863 16.8057C12.9303 16.8346 12.8761 16.8628 12.8213 16.8896C12.7431 16.9281 12.664 16.9655 12.584 17.002L12.4287 17.0713C12.3268 17.1154 12.2231 17.1565 12.1182 17.1973C12.1066 17.2018 12.0951 17.2068 12.085 17.2109C12.0745 17.2152 12.0648 17.2192 12.0557 17.2227L11.6865 17.3525C11.6795 17.3548 11.6726 17.3567 11.668 17.3584C11.6627 17.3603 11.6592 17.3623 11.6562 17.3633C11.5342 17.403 11.4104 17.4389 11.2852 17.4736C11.2768 17.476 11.2678 17.4784 11.2607 17.4805C11.2535 17.4826 11.2473 17.4847 11.2412 17.4863C11.1285 17.517 11.0146 17.5448 10.8994 17.5713C10.8635 17.5796 10.8411 17.5859 10.8096 17.5928C10.6921 17.6185 10.5731 17.641 10.4531 17.6621C10.4362 17.6651 10.4208 17.6677 10.4023 17.6709C10.2913 17.6898 10.1792 17.7059 10.0664 17.7207C10.0202 17.7268 9.97597 17.7331 9.93164 17.7383C9.85433 17.7472 9.77647 17.7547 9.69727 17.7617C9.61434 17.7692 9.53166 17.7761 9.44922 17.7812C9.3898 17.7849 9.33159 17.7886 9.27344 17.791L8.98535 17.7979C8.96868 17.798 8.95221 17.7982 8.93848 17.7988C8.92399 17.7995 8.91197 17.8008 8.90039 17.8008C8.89301 17.8008 8.8852 17.8003 8.875 17.7998C8.8655 17.7994 8.85319 17.7989 8.84082 17.7988C8.74016 17.7982 8.63878 17.7951 8.53711 17.791C8.48414 17.7889 8.43357 17.7871 8.38281 17.7842C8.28162 17.7784 8.17984 17.7701 8.07812 17.7607C8.03622 17.7569 7.99622 17.7533 7.95605 17.749C7.85507 17.7383 7.75355 17.7253 7.65137 17.7109C7.59576 17.7031 7.55202 17.6983 7.50195 17.6904C7.41764 17.6771 7.33441 17.66 7.24707 17.6436C7.1813 17.6312 7.12249 17.6222 7.06152 17.6094C6.9868 17.5937 6.91284 17.5749 6.83594 17.5566L6.63574 17.5088C6.56975 17.4915 6.50625 17.4722 6.43652 17.4521C6.35702 17.4293 6.28275 17.4085 6.20801 17.3848C6.15302 17.3673 6.09982 17.3487 6.04199 17.3291C5.95839 17.3008 5.87604 17.2724 5.79492 17.2422C5.74593 17.2239 5.70007 17.2052 5.64746 17.1846C5.55766 17.1493 5.4701 17.1143 5.38379 17.0771C5.33785 17.0574 5.29865 17.0385 5.24805 17.0156L4.99707 16.8994C4.9436 16.8733 4.89101 16.8457 4.83594 16.8174C4.75609 16.7763 4.67769 16.735 4.60059 16.6924C4.55573 16.6676 4.51108 16.6419 4.46484 16.6152C4.38274 16.5679 4.30154 16.5202 4.22168 16.4707C4.17656 16.4427 4.13211 16.4136 4.08594 16.3838C4.00414 16.3311 3.92277 16.2783 3.84375 16.2236C3.80339 16.1957 3.76486 16.167 3.72266 16.1367C3.64628 16.082 3.57031 16.0265 3.49609 15.9697C3.4838 15.9603 3.47155 15.9509 3.46094 15.9434C3.45456 15.9388 3.44877 15.9346 3.44336 15.9307C3.43981 15.9269 3.43682 15.9222 3.43262 15.9189C1.34707 14.2919 0.00308783 11.759 0 8.91016C0.000158302 8.90878 0.000580107 8.90538 0.000976562 8.90234C0.00179121 8.89611 0.00285238 8.88635 0.00488281 8.87402C0.00901137 8.84901 0.0163551 8.8124 0.0273438 8.76855C0.0494395 8.68041 0.0869047 8.56359 0.150391 8.44824C0.27596 8.22016 0.497514 8 0.900391 8C1.30327 8 1.52482 8.22016 1.65039 8.44824C1.71388 8.56359 1.75134 8.68041 1.77344 8.76855C1.78443 8.8124 1.79177 8.84901 1.7959 8.87402C1.79793 8.88635 1.79899 8.89611 1.7998 8.90234C1.8002 8.90538 1.80062 8.90781 1.80078 8.90918C1.80607 12.8054 4.94928 15.965 8.83887 15.998C8.89237 15.9985 8.94575 15.9978 8.99805 15.9971C12.8539 15.9449 15.9657 12.8216 15.998 8.96094C15.9985 8.90746 15.9978 8.85409 15.9971 8.80176C15.9884 8.16977 15.8979 7.55755 15.7344 6.97559C15.6787 6.7772 15.614 6.58114 15.541 6.3877C14.5319 3.7225 11.9662 1.82329 8.95215 1.80176C7.12091 1.7898 5.303 2.48341 3.93262 3.8291C3.90376 3.85756 3.89481 3.90095 3.91016 3.93848C3.92556 3.97599 3.96236 4 4.00293 4H5.90039L5.99219 4.00488C6.44613 4.05086 6.80078 4.43432 6.80078 4.90039C6.80074 5.39742 6.39741 5.80078 5.90039 5.80078H1.90039C1.46352 5.80078 1.09936 5.48896 1.01758 5.07617L1.00488 4.99316L1 4.89551V0.900391C1 0.403334 1.40333 0 1.90039 0Z"
              fill="white"
            />
          </svg>
        </div>
      </div>
    </div>
    <footer class="footer">
      <div>
        <p class="p">PRIVACY</p>
      </div>
      <div>
        <p class="p">COOKIES</p>
      </div>
    </footer>

    <div v-if="$store.isMobile" id="language">
      <p>{{ $store.sessionData.language }}</p>
      <svg width="15" height="9" viewBox="0 0 15 9" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M6.77819 8.19239C6.38767 7.80186 6.38767 7.1687 6.77819 6.77817L13.2635 0.292969C13.6541 -0.0975555 14.2872 -0.0975555 14.6778 0.292969C15.0683 0.683493 15.0683 1.31666 14.6778 1.70718L8.19241 8.19239C7.80188 8.58291 7.16872 8.58291 6.77819 8.19239Z"
          fill="#279ED1"
        />
        <path
          d="M8.19241 8.19239C8.58293 7.80186 8.58293 7.1687 8.19241 6.77817L1.70711 0.292893C1.31658 -0.0976311 0.683418 -0.0976311 0.292893 0.292893C-0.0976311 0.683417 -0.0976311 1.31658 0.292893 1.70711L6.77819 8.19239C7.16872 8.58291 7.80188 8.58291 8.19241 8.19239Z"
          fill="#279ED1"
        />
      </svg>
      <select @change="handleLanguageChange">
        <option v-for="locale in LOCALES" :key="locale.id" :value="locale.id">
          {{ locale.label }}
        </option>
      </select>
    </div>
  </main>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import btn from '../../ui/btn.vue'
import { useAppStore } from '@renderer/store'
import { LOCALES } from '@renderer/store/locale'

function getQueryParam(name: string): string | null {
  if (typeof window === 'undefined') return null
  const params = new URLSearchParams(window.location.search)
  return params.get(name)
}

const $store = useAppStore()

const playlists = [
  {
    label: 'CHILL',
    url: 'https://open.spotify.com/playlist/4oWoNQmxxDr7NlyENENcam?si=N9N5Cd9wRHGMFEiyOuc7nw&pi=KxKcgYobRgOAw',
    image: '/landing/images/product-chill.jpg'
  },
  {
    label: 'GROOVY',
    url: 'https://open.spotify.com/playlist/4z18EIIZ948U9mh3JFbddL?si=8zHhm9kgQE6dt7Ry7KcIpw&pi=NBein343S82me',
    image: '/landing/images/product-groovy.jpg'
  },
  {
    label: 'FUNKY',
    url: 'https://open.spotify.com/playlist/5kI5SYjRFHLlnjKdbyyhNn?si=BAWJgn2hSw2KqKpS8KCTww&pi=zjbQdd_9QzS50',
    image: '/landing/images/product-funky.jpg'
  },
  {
    label: 'PARTY',
    url: 'https://open.spotify.com/playlist/2NL3uZrVLmBfLnqnDS2VE9?si=2Osm6eKtQjO3zrLzdsleqA&pi=WbsnqM07Qcmow',
    image: '/landing/images/product-party.jpg'
  }
]

const restartApp = (): void => {
  const url = new URL(window.location.href)
  // Remove all existing search params
  url.search = ''
  // If lang param exists in the current URL, put it back
  const lang = getQueryParam('lang')
  if (lang) {
    url.searchParams.set('lang', lang)
  }
  window.location.href = url.toString()
}

const handleLanguageChange = (event: Event): void => {
  const target = event.target as HTMLSelectElement
  const selectedLang = target.value

  // Update the URL by replacing only the "lang" param, maintaining all others
  const url = new URL(window.location.href)
  url.searchParams.set('lang', selectedLang)
  window.location.href = url.toString()
}

const activePlaylist = computed(() => {
  const mood = getQueryParam('mood') ? (getQueryParam('mood') as string) : 'funky'
  return playlists.find((playlist) => playlist.label.toLowerCase() === mood)
})

const activeMood = computed(() => {
  const mood = getQueryParam('mood') ? (getQueryParam('mood') as string) : 'funky'
  return mood
})

const activeWallpaper = computed(() => {
  const fader = getQueryParam('fader')
    ? parseInt(parseFloat((getQueryParam('fader') as string) || '0').toFixed(1))
    : 0
  let dayMood = 'day'

  if (fader > 30 && fader <= 80) {
    dayMood = 'middle'
  } else if (fader > 80) {
    dayMood = 'night'
  }

  const randomInt = Math.floor(Math.random() * 4) + 1
  return `/landing/wallpaper/${dayMood}_${randomInt}.png`
})

const share = async () => {
  if (navigator.share) {
    navigator
      .share({
        title: document.title,
        text: 'Check this out!',
        url: window.location.href
      })
      .catch((error) => {
        console.error(error)
        // Do nothing or handle the error as needed
      })
  } else {
    // fallback - copy url to clipboard
    try {
      navigator.clipboard.writeText(window.location.href)
      alert('Link copied to clipboard')
    } catch (e) {
      console.error(e)
      alert('Unable to share this page.')
    }
  }
}
</script>

<style lang="scss" scoped>
.page-index {
  position: relative;
  width: 100vw !important;
  min-height: 100vh;
  background: linear-gradient(180deg, #ece3d4 19.95%, #4cb9e8 99.73%);

  padding: 16px 16px;

  color: #4fb2dd;
  text-align: center;

  * {
    font-size: 14px !important;
  }

  &::after {
    content: '';
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 100;
    background: radial-gradient(ellipse at center, transparent 80%, rgba(0, 0, 0, 0.1) 100%);
    z-index: 0;
  }

  #noise {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-image: url('/images/noise.png');
    background-repeat: repeat;
    background-size: 124px;
    mix-blend-mode: multiply;
    opacity: 0.08;
  }

  .container {
    position: relative;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;
    z-index: 10;

    > div {
      position: relative;
      width: 100%;

      &.logo {
        width: 180px;
      }

      &.margin {
        margin-top: 18px;
      }

      &.margin-small {
        margin-top: 6px;
      }
    }
  }

  .discover-cta {
    position: relative;
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;

    &:deep(.btn) {
      .p {
        font-size: 14px;
        font-weight: 900;
        line-height: 26px;
        letter-spacing: 14%;
      }
    }

    > * {
      &:nth-child(1) {
        width: 100%;
      }
    }
  }

  .noise {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    pointer-events: none;
    z-index: 0;

    svg {
      position: absolute;
      width: 100%;
      height: 100%;
      top: 0;
      left: 0;
      pointer-events: none;
      z-index: 0;
    }
  }

  img {
    position: relative;
    width: 100%;
    height: auto;
    max-width: unset;

    &.product {
      width: 100vw;
      left: 50%;
      transform: translateX(-50%);
    }
  }

  .icon {
    position: relative;
    width: 54px;
    height: 54px;
    flex: 0 0 54px;
    display: flex;
    justify-content: center;
    align-items: center;
    backdrop-filter: blur(6px) saturate(1.2);

    background: linear-gradient(180deg, rgba(255, 255, 255, 0.02) 0%, rgba(64, 237, 253, 0.1) 100%);

    border-radius: 30px;
    box-shadow:
			// top edge light catch
      inset 0 1px 0 rgba(255, 255, 255, 0.45),
      // bottom cyan tint
      inset 0 -1px 0 rgba(64, 237, 253, 0.2),
      // left edge
      inset 1px 0 rgba(255, 255, 255, 0.08),
      // right edge
      inset -1px 0 rgba(255, 255, 255, 0.8),
      // outer glow
      0 8px 32px rgba(15, 184, 240, 0.65),
      0 2px 8px rgba(0, 0, 0, 0.2);
  }

  .screen {
    position: relative;
    width: 100%;
    aspect-ratio: 362 / 343;
    border-radius: 32px;
    overflow: hidden;

    img {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .social {
      position: absolute;
      width: 100%;
      bottom: 0;
      right: 0;
      display: flex;
      padding: 12px 12px;
      justify-content: space-between;
      gap: 16px;
    }
  }

  p {
    // text-shadow: 0 1px 1px rgba(0, 0, 0, 0.1);

    &.white {
      color: white;
    }

    &.info {
      line-height: 26px;
      font-weight: 500;
    }
  }
}

.footer {
  position: relative;
  width: 100%;
  margin-top: 64px;
  padding: 16px;
  z-index: 100;
  display: flex;
  justify-content: space-between;
  align-items: center;

  p {
    color: white;
  }
}

#language {
  position: absolute;
  top: 24px;
  right: 24px;
  width: auto;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100000;
  gap: 8px;

  p {
    font-size: 14px;
  }

  select {
    position: absolute;
    width: 100%;
    height: 100%;
    opacity: 0;
  }
}
</style>
