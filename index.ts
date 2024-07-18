import { createOpenAI } from '@ai-sdk/openai'
import { generateText } from 'ai'
import Jimp from 'jimp'

const groq = createOpenAI({
  apiKey: process.env.GROQ_API_KEY ?? '',
  baseURL: 'https://api.groq.com/openai/v1'
})

const writeText = (
  image: Jimp,
  {
    text,
    font,
    x,
    y,
    maxWidth
  }: {
    text: string
    font: any
    x: number
    y: number
    maxWidth: number
  }
) => {
  image.print(
    font,
    x,
    y,
    {
      text,
      alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
      alignmentY: Jimp.VERTICAL_ALIGN_TOP
    },
    maxWidth
  )
}

const generateMeme = async () => {
  try {
    const { text } = await generateText({
      model: groq('gemma2-9b-it'),
      temperature: 0.7,
      frequencyPenalty: 1,
      presencePenalty: 1,
      prompt: `
      Conoces el meme del Capitán América en el ascensor. Tu tarea es generar los mensajes chistosos del dialogo entre el Capitán América y el Agente con el humor negro característico de dicho meme. Los chistes deben ser cortos, muy graciosos y pueden ser totalmente aleatorios sobre cualquier tema. No debes dar un chiste repetido, asegúrate que el chiste sea totalmente nuevo. Asegúrate de que sean buenos chistes, bien construidos, y que puedan incluir humor vulgar si es necesario. Solo asegúrate de que sean cortos y certeros.
      Asegúrate de que puedan variar entre preguntas y declaraciones chistosas de cualquier tipo.
      Sólo debes devolver un array con los 3 mensajes. Ten en cuenta que sólo son 3 mensajes.
      Tambien que los chistes no solo sean de tipo preguntas sino pueden por ejemplo del tipo:

      [
        "No les entiendo a los africanos",
        "¿Por que?",
        "Porque no son claros"
      ]

      El template es el siguiente:

      Capitán América (0):  
      Agente (1):  
      Capitán América (2):

      Solo consta de 3 mensajes.

      Dame la respuesta en un JSON. No me des nada más que el JSON. No digas nada más solo responde con un JSON.

      Ejemplo de respuesta:

      [
        "¿Viste lo que le pasó a Chu?",
        "¿A Chu?",
        "Salud"
      ]
    `
    })

    const [capInitMsg, agentMsg, capFinalMsg]: string[] = JSON.parse(text)

    const image = await Jimp.read('./template.jpg')
    const font = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE)
    writeText(image, {
      text: capInitMsg,
      font,
      x: 10,
      y: 150 - capInitMsg.length * 0.5,
      maxWidth: 500
    })
    writeText(image, {
      text: agentMsg,
      font,
      x: 10,
      y: 380 - agentMsg.length,
      maxWidth: 250
    })
    writeText(image, {
      text: capFinalMsg,
      font,
      x: 300,
      y: 380 - capFinalMsg.length,
      maxWidth: 250
    })
    await image.writeAsync('output.png')

    console.info(
      `Capitán América: ${capInitMsg}\nAgente: ${agentMsg}\nCapitán América: ${capFinalMsg}`
    )
  } catch (error) {
    console.error({ error })
    if (error instanceof Error) {
      console.error(error.message)
    }

    generateMeme()
  }
}

generateMeme()
