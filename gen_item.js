function generateItem({t,h,l,n}){
    let inner = /*html*/`
        <div class="swiper-slide">
          <div class="pag">
              <div class="head_page">
                  <div class="head_page_info">
                      <div class="img_info"></div>
                      <div class="title_info">${n}</div>
                  </div>  
              </div>
              <div class="pag_info">
                <div class="col">
                  <div class="graph temp" id="temp_graph_${n}_1"></div>
                  <div style="color:white" class="temp_text">Temperatura</div>
                </div>
                <div class="col">
                  <div class="graph umid" id="temp_graph_${n}_2"></div>
                  <div style="color:white" class="temp_text">Umidade</div>
                </div>
                <div class="col">
                  <div class="title_info">${l}</div>
                </div>
              </div>
          </div>
        </div>
    `
    return inner.trim()
}

function pageHome(){
  let inner = /*html*/`
      <div class="pag_home">
        <div class="pag_logo"></div>
        <input id="host_ngrok" class="input" type="text">
        <button class="button">Conectar</button>
      </div>
  `
  return inner.trim()
}

const isChromeForIOs145 = () => {
    const userAgent = window.navigator.userAgent;
    const isChromeForIOs = /CriOS/i.test(userAgent);
    if (isChromeForIOs) {
      const iOsMatch = userAgent.match(
        /(.+)(iPhone|iPad|iPod)(.+)OS[\s|\_](\d+)\_?(\d+)?[\_]?(\d+)?.+/i
      );
      if (iOsMatch && iOsMatch.length >= 6) {
        const iOsVersionMajor = parseInt(iOsMatch[4], 10);
        const iOsVersionMinor = parseInt(iOsMatch[5], 10);
        if (iOsVersionMajor >= 14 && iOsVersionMinor >= 5) {
          return true;
        }
      }
    }
    return false;
  }