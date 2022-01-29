export const parseURI = async (uri: string) => {
  let src: string = uri
  if (uri.indexOf("data:application/json;base64,") === 0) {
    console.log(uri.split("data:application/json;base64,")[1])
    src = JSON.parse(atob(uri.split("data:application/json;base64,")[1])).image
  } else if (uri.indexOf("ipfs://") === 0) {
    const response = await fetch(`https://ipfs.io/ipfs/${uri.split("ipfs://")[1]}`) // TODO: use IPFS gateway
    const json = await response.json()
    src = json.image
  } else if (uri.indexOf("http://") === 0 || uri.indexOf("https://") === 0) {
    const response = await fetch(uri)
    const json = await response.json()
    src = json.image
  } else {
    // TODO: No image found image
  }

  if (src.indexOf("ipfs://") === 0) {
    src = `https://ipfs.io/ipfs/${src.split("ipfs://")[1]}`
  }
  
  return src
}