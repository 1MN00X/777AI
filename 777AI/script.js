const input = document.getElementById('imageInput');
const processBtn = document.getElementById('processBtn');
const downloadBtn = document.getElementById('downloadBtn');
const status = document.getElementById('status');
const canvas = document.getElementById('outputCanvas');
const ctx = canvas.getContext('2d');
const effectsListDiv = document.getElementById('effectsList');

let selectedFile;
let selectedEffects = [];

const effects = [
  "NightVision","CinemaTone","VividBoost","CrystalSharp","SkinGlow","EyeFocus","TeethBright","HDRBoost",
  "ShadowLift","HighlightBalance","WarmSun","CoolShade","LandscapeEnhance","PortraitPerfect","LensMagic","BokehDream",
  "GlowLens","FilmGrain","ToneMapping","SepiaSunset","CyanCool","PosterizeArt","EdgeGlow","ShadowBoost",
  "HighlightBoost","MidToneBalance","BrightnessCurve","WhiteBalanceFix","ExposurePlus","SaturationMask","VibranceMask",
  "ClarityMask","GlowHighlights","ColorPopSelective","AutoHDRMerge","ToneCurveMapping","NightSkyEnhance","SunsetGlow",
  "MorningLight","ProCameraStyle"
];

effects.forEach(eff=>{
  const label = document.createElement('label');
  label.classList.add('effect-checkbox');
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.value = eff;
  checkbox.addEventListener('change', (ev)=>{
    if(ev.target.checked) selectedEffects.push(ev.target.value);
    else selectedEffects = selectedEffects.filter(v=>v!==ev.target.value);
  });
  label.appendChild(checkbox);
  label.appendChild(document.createTextNode(eff));
  effectsListDiv.appendChild(label);
});

input.addEventListener('change', e=>{ selectedFile = e.target.files[0]; });

processBtn.addEventListener('click', async ()=>{
  if(!selectedFile){ alert('Pilih foto dulu!'); return; }
  status.textContent = '🔄 Memproses foto... Mohon tunggu beberapa detik.';

  try{
    const img = document.createElement('img');
    img.src = URL.createObjectURL(selectedFile);
    await img.decode();

    const upscaler = new Upscaler({model:'esrgan'});
    const upscaledCanvas = await upscaler.upscale(img);

    canvas.width = upscaledCanvas.width;
    canvas.height = upscaledCanvas.height;
    ctx.drawImage(upscaledCanvas,0,0);

    const imageData = ctx.getImageData(0,0,canvas.width,canvas.height);
    const data = imageData.data;

    function applyEffects(i=0){
      if(i>=data.length) return;
      const step = 4;
      selectedEffects.forEach(eff=>{
        switch(eff){
          case "NightVision": data[i]+=5; data[i+1]+=5; break;
          case "CinemaTone": data[i]+=2; data[i+2]-=2; break;
          case "VividBoost": data[i]*=1.05; data[i+1]*=1.05; data[i+2]*=1.05; break;
          case "CrystalSharp": data[i]=Math.min(255,data[i]*1.08); data[i+1]=Math.min(255,data[i+1]*1.08); data[i+2]=Math.min(255,data[i+2]*1.08); break;
          case "SkinGlow": data[i+1]=Math.min(255,data[i+1]*1.03); break;
        }
      });
      setTimeout(()=>applyEffects(i+step),0);
    }
    applyEffects(0);
    ctx.putImageData(imageData,0,0);

    // Watermark teks
    ctx.font = `${Math.floor(canvas.width/25)}px Arial`;
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.textAlign = 'right';
    ctx.fillText('777AI', canvas.width-10, canvas.height-10);

    // Watermark logo
    const logoImg = new Image();
    logoImg.src = 'assets/logo.png';
    logoImg.onload = () => {
      const logoWidth = canvas.width * 0.12;
      const logoHeight = logoImg.height * (logoWidth / logoImg.width);
      ctx.globalAlpha = 0.15;
      ctx.drawImage(logoImg, canvas.width-logoWidth-10, canvas.height-logoHeight-30, logoWidth, logoHeight);
      ctx.globalAlpha = 1.0;
    }

    status.textContent = '✅ Selesai! Foto HD siap, efek diterapkan, watermark aktif.';
  } catch(e){
    alert('Gagal memproses foto. Coba file lain.');
    console.error(e);
    status.textContent = '';
  }
});

downloadBtn.addEventListener('click', ()=>{
  const link = document.createElement('a');
  link.download = '777AI_HD.png';
  link.href = canvas.toData URL();
  link.click();
});