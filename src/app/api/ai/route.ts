import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

const SYSTEM_PROMPT = `أنت مساعد ذكي متخصص في الإبداع وتطوير الأفكار. أنت جزء من تطبيق HussamVision - محور شخصي للمستخدم حسام.

قواعدك:
- أجب دائما باللغة العربية
- كن مختصراً ومفيداً ومحفزاً
- قدم أفكاراً عملية وقابلة للتنفيذ
- ركز على المجال المحدد في الطلب
- استخدم تنسيق بسيط: نقاط ماركر أو أرقام
- لا تذكر أنك مساعد AI أو شات بوت
- إجاباتك يجب أن تكون ملهمة ومبتكرة

المجالات المتاحة:
- design: تصميم UI/UX، جرافيك، فنون بصرية
- code: برمجة، تطوير تطبيقات، مشاريع تقنية
- art: فنون إبداعية، رسم، تصوير، موسيقى
- text: كتابة، تأليف، مدونات، محتوى
- cooking: طبخ، وصفات، تجارب غذائية
- other: أفكار عامة، تنمية ذاتية، حياة يومية`

export async function POST(request: NextRequest) {
  try {
    const { action, context, ideaTitle, ideaContent, ideaCategory, conversation } = await request.json()

    const zai = await ZAI.create()

    let systemPrompt = SYSTEM_PROMPT
    let userMessage = ''

    switch (action) {
      case 'suggest_idea':
        systemPrompt += `\n\nالمستخدم يطلب فكرة جديدة. المجال: ${ideaCategory || 'عام'}. ${context ? `السياق: ${context}` : ''}`
        userMessage = `اقترح لي فكرة إبداعية واحدة فقط. اكتبها بهذا التنسيق:
عنوان الفكرة: [عنوان قصير]
الوصف: [وصف مختصر 2-3 أسطر]
المزايا: [2-3 نقاط عن لماذا هذه الفكرة مميزة]
الخطوة الأولى: [ماذا يمكنني أن أفعل الآن]`
        break

      case 'expand_idea':
        systemPrompt += `\n\nالمستخدم يريد توسيع فكرة موجودة. المجال: ${ideaCategory || 'عام'}.`
        userMessage = `وسّع هذه الفكرة وقدم خطة عملية:
العنوان: ${ideaTitle || 'فكرة'}
الوصف الحالي: ${ideaContent || 'لا يوجد'}
اعطني:
1. تحليل الفرص والتحديات
2. 5 خطوات عملية مرقمة للتنفيذ
3. الأدوات والموارد المطلوبة
4. نصيحة مهمة واحدة`
        break

      case 'improve_idea':
        systemPrompt += `\n\nالمستخدم يريد تحسين فكرة. المجال: ${ideaCategory || 'عام'}.`
        userMessage = `حسّن هذه الفكرة وقدم اقتراحات مبتكرة:
العنوان: ${ideaTitle || 'فكرة'}
الوصف الحالي: ${ideaContent || 'لا يوجد'}
اعطني:
1. 3 نقاط ضعف يمكن تحسينها
2. 3 اقتراحات مبتكرة لإضافة مميزات جديدة
3. اقتراح لتعزيز التنفيذ`
        break

      case 'chat':
        systemPrompt += '\n\nالمستخدم يتحدث معك عن أفكاره. أجب بذكاء وساعد في تطوير الأفكار.'
        userMessage = conversation || 'مرحباً'
        break

      case 'daily_inspiration':
        systemPrompt += '\n\nالمستخدم يريد إلهام يومي سريع. كن مختصراً جداً.'
        userMessage = `أعطني نصيحة إبداعية واحدة فقط في جملة أو جملتين. اجعلها محفزة وقابلة للتنفيذ اليوم. لا تكرر النصائح الشائعة - كن مبتكراً.`
        break

      default:
        userMessage = context || 'ساعدني في التفكير الإبداعي'
    }

    const completion = await zai.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.8,
      max_tokens: 800,
    })

    const response = completion.choices[0]?.message?.content || 'عذراً، لم أتمكن من توليد استجابة.'

    return NextResponse.json({ success: true, response })

  } catch (error) {
    console.error('AI API Error:', error)
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في الخدمة' },
      { status: 500 }
    )
  }
}
