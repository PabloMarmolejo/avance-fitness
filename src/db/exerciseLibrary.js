/**
 * Exercise Library - Pre-loaded Exercise Database
 * 
 * Comprehensive collection of common exercises categorized by muscle groups
 */

export const EXERCISE_CATEGORIES = {
    CHEST: 'chest',
    BACK: 'back',
    LEGS: 'legs',
    SHOULDERS: 'shoulders',
    ARMS: 'arms',
    CORE: 'core',
    CARDIO: 'cardio',
    FUNCTIONAL: 'functional'
};

export const CATEGORY_LABELS = {
    chest: { name: 'Pecho', emoji: '💪', color: '#ef4444' },
    back: { name: 'Espalda', emoji: '🔙', color: '#3b82f6' },
    legs: { name: 'Piernas', emoji: '🦵', color: '#8b5cf6' },
    shoulders: { name: 'Hombros', emoji: '💪', color: '#f59e0b' },
    arms: { name: 'Brazos', emoji: '💪', color: '#10b981' },
    core: { name: 'Core', emoji: '⚡', color: '#ec4899' },
    cardio: { name: 'Cardio', emoji: '🏃', color: '#06b6d4' },
    functional: { name: 'Funcional', emoji: '🤸', color: '#a855f7' }
};

export const EXERCISES_DATABASE = [
    // ============ PECHO (CHEST) ============
    {
        name: 'Press de Banca Plano',
        category: 'chest',
        difficulty: 'intermediate',
        equipment: ['barra', 'banco'],
        description: 'Ejercicio fundamental para desarrollar el pecho. Se realiza acostado en un banco plano empujando una barra hacia arriba.',
        instructions: [
            'Acuéstate en un banco plano con los pies firmes en el suelo',
            'Agarra la barra con las manos ligeramente más anchas que los hombros',
            'Baja la barra controladamente hasta el pecho',
            'Empuja hacia arriba hasta extender los brazos completamente'
        ],
        tips: [
            'Mantén los omóplatos retraídos',
            'No arquees excesivamente la espalda',
            'Controla el descenso de la barra'
        ],
        musclesWorked: {
            primary: ['Pectoral mayor'],
            secondary: ['Tríceps', 'Deltoides anterior']
        }
    },
    {
        name: 'Press de Banca Inclinado',
        category: 'chest',
        difficulty: 'intermediate',
        equipment: ['barra', 'banco inclinado'],
        description: 'Variante del press de banca que enfatiza la parte superior del pecho.',
        instructions: [
            'Ajusta el banco a 30-45 grados de inclinación',
            'Acuéstate y agarra la barra',
            'Baja hasta la parte superior del pecho',
            'Empuja hacia arriba'
        ],
        tips: ['No inclines demasiado el banco (máximo 45°)', 'Mantén los codos a 45° del cuerpo'],
        musclesWorked: { primary: ['Pectoral superior'], secondary: ['Deltoides anterior', 'Tríceps'] }
    },
    {
        name: 'Flexiones (Push-ups)',
        category: 'chest',
        difficulty: 'beginner',
        equipment: [],
        description: 'Ejercicio con peso corporal excelente para pecho, hombros y tríceps.',
        instructions: [
            'Colócate en posición de plancha con manos al ancho de hombros',
            'Baja el cuerpo hasta que el pecho casi toque el suelo',
            'Empuja hacia arriba hasta la posición inicial'
        ],
        tips: ['Mantén el core activado', 'No dejes caer las caderas', 'Codos a 45° del cuerpo'],
        musclesWorked: { primary: ['Pectoral'], secondary: ['Tríceps', 'Deltoides', 'Core'] }
    },
    {
        name: 'Aperturas con Mancuernas',
        category: 'chest',
        difficulty: 'intermediate',
        equipment: ['mancuernas', 'banco'],
        description: 'Ejercicio de aislamiento que estira y trabaja el pecho.',
        instructions: [
            'Acuéstate en banco con una mancuerna en cada mano',
            'Extiende brazos hacia arriba',
            'Baja mancuernas en arco abriendo los brazos',
            'Sube juntando las mancuernas arriba'
        ],
        tips: ['Mantén ligera flexión en codos', 'No bajes demasiado para evitar lesiones', 'Controla el movimiento'],
        musclesWorked: { primary: ['Pectoral'], secondary: ['Deltoides anterior'] }
    },
    {
        name: 'Fondos en Paralelas',
        category: 'chest',
        difficulty: 'intermediate',
        equipment: ['paralelas'],
        description: 'Ejercicio compuesto que trabaja pecho y tríceps con el peso corporal.',
        instructions: [
            'Agárrate de las barras paralelas',
            'Inclina el torso hacia adelante',
            'Baja flexionando los codos',
            'Empuja hasta extender los brazos'
        ],
        tips: ['Inclínate más hacia adelante para enfatizar pecho', 'No bajes demasiado si sientes dolor en hombros'],
        musclesWorked: { primary: ['Pectoral inferior', 'Tríceps'], secondary: ['Deltoides'] }
    },

    // ============ ESPALDA (BACK) ============
    {
        name: 'Dominadas (Pull-ups)',
        category: 'back',
        difficulty: 'advanced',
        equipment: ['barra dominadas'],
        description: 'Ejercicio rey para la espalda. Levanta todo tu peso corporal.',
        instructions: [
            'Agarra la barra con las palmas hacia afuera',
            'Cuelga con brazos extendidos',
            'Tira hacia arriba hasta que la barbilla supere la barra',
            'Baja controladamente'
        ],
        tips: ['Activa los dorsales antes de tirar', 'Evita balancearte', 'Baja completamente entre repeticiones'],
        musclesWorked: { primary: ['Dorsal ancho'], secondary: ['Bíceps', 'Trapecio', 'Romboides'] }
    },
    {
        name: 'Remo con Barra',
        category: 'back',
        difficulty: 'intermediate',
        equipment: ['barra'],
        description: 'Excelente ejercicio compuesto para grosor de espalda.',
        instructions: [
            'Inclínate hacia adelante con la espalda recta',
            'Agarra la barra con las manos al ancho de hombros',
            'Tira de la barra hacia el ombligo',
            'Baja controladamente'
        ],
        tips: ['Mantén la espalda neutra', 'Lleva los codos hacia atrás', 'No uses impulso'],
        musclesWorked: { primary: ['Dorsal', 'Trapecio medio'], secondary: ['Bíceps', 'Romboides'] }
    },
    {
        name: 'Peso Muerto',
        category: 'back',
        difficulty: 'advanced',
        equipment: ['barra'],
        description: 'Ejercicio compuesto fundamental que trabaja toda la cadena posterior.',
        instructions: [
            'Coloca los pies al ancho de caderas bajo la barra',
            'Agarra la barra con manos fuera de las piernas',
            'Mantén espalda recta y levanta extendiendo caderas y rodillas',
            'Baja controladamente'
        ],
        tips: ['Mantén la barra cerca del cuerpo', 'Espalda siempre recta', 'Impulsa con las piernas'],
        musclesWorked: { primary: ['Espalda baja', 'Glúteos', 'Isquiotibiales'], secondary: ['Trapecio', 'Core'] }
    },
    {
        name: 'Jalón al Pecho',
        category: 'back',
        difficulty: 'beginner',
        equipment: ['polea alta'],
        description: 'Alternativa a las dominadas, ideal para principiantes.',
        instructions: [
            'Siéntate y ajusta el soporte de piernas',
            'Agarra la barra ancha con palmas hacia afuera',
            'Tira hacia el pecho',
            'Sube controladamente'
        ],
        tips: ['No te inclines demasiado hacia atrás', 'Saca el pecho', 'Lleva los codos hacia abajo y atrás'],
        musclesWorked: { primary: ['Dorsal ancho'], secondary: ['Bíceps', 'Trapecio'] }
    },
    {
        name: 'Remo con Mancuerna',
        category: 'back',
        difficulty: 'beginner',
        equipment: ['mancuerna', 'banco'],
        description: 'Ejercicio unilateral que permite trabajar cada lado independientemente.',
        instructions: [
            'Apoya una rodilla y mano en el banco',
            'Toma la mancuerna con la mano libre',
            'Tira de la mancuerna hacia la cadera',
            'Baja controladamente'
        ],
        tips: ['Mantén la espalda paralela al suelo', 'No rotes el torso', 'Lleva el codo hacia atrás'],
        musclesWorked: { primary: ['Dorsal'], secondary: ['Bíceps', 'Trapecio'] }
    },

    // ============ PIERNAS (LEGS) ============
    {
        name: 'Sentadilla con Barra',
        category: 'legs',
        difficulty: 'intermediate',
        equipment: ['barra', 'rack'],
        description: 'El rey de los ejercicios de piernas. Trabaja todo el tren inferior.',
        instructions: [
            'Coloca la barra en la parte superior de la espalda',
            'Pies al ancho de hombros',
            'Baja flexionando rodillas y caderas',
            'Sube empujando con los talones'
        ],
        tips: ['Mantén el pecho arriba', 'Rodillas alineadas con los pies', 'Baja hasta que los muslos estén paralelos al suelo'],
        musclesWorked: { primary: ['Cuádriceps', 'Glúteos'], secondary: ['Isquiotibiales', 'Core'] }
    },
    {
        name: 'Prensa de Piernas',
        category: 'legs',
        difficulty: 'beginner',
        equipment: ['máquina prensa'],
        description: 'Ejercicio en máquina que permite usar mucho peso de forma segura.',
        instructions: [
            'Siéntate y coloca los pies en la plataforma',
            'Libera los seguros',
            'Baja flexionando las rodillas',
            'Empuja hacia arriba sin bloquear completamente'
        ],
        tips: ['No despegues la espalda baja del respaldo', 'Pies al ancho de hombros', 'Controla el descenso'],
        musclesWorked: { primary: ['Cuádriceps', 'Glúteos'], secondary: ['Isquiotibiales'] }
    },
    {
        name: 'Zancadas',
        category: 'legs',
        difficulty: 'beginner',
        equipment: ['mancuernas'],
        description: 'Ejercicio unilateral excelente para equilibrio y fuerza.',
        instructions: [
            'Da un paso largo hacia adelante',
            'Baja flexionando ambas rodillas',
            'La rodilla trasera casi toca el suelo',
            'Empuja con la pierna delantera para volver'
        ],
        tips: ['Mantén el torso erguido', 'Rodilla delantera no debe pasar la punta del pie', 'Activa el core'],
        musclesWorked: { primary: ['Cuádriceps', 'Glúteos'], secondary: ['Isquiotibiales', 'Core'] }
    },
    {
        name: 'Peso Muerto Rumano',
        category: 'legs',
        difficulty: 'intermediate',
        equipment: ['barra'],
        description: 'Variante del peso muerto que enfatiza isquiotibiales y glúteos.',
        instructions: [
            'Sostén la barra con brazos extendidos',
            'Inclínate hacia adelante desde las caderas',
            'Baja la barra cerca de las piernas',
            'Vuelve a la posición inicial'
        ],
        tips: ['Mantén ligera flexión en rodillas', 'Espalda recta en todo momento', 'Siente el estiramiento en isquiotibiales'],
        musclesWorked: { primary: ['Isquiotibiales', 'Glúteos'], secondary: ['Espalda baja'] }
    },
    {
        name: 'Curl Femoral',
        category: 'legs',
        difficulty: 'beginner',
        equipment: ['máquina curl femoral'],
        description: 'Ejercicio de aislamiento para la parte posterior del muslo.',
        instructions: [
            'Acuéstate boca abajo en la máquina',
            'Coloca los tobillos bajo el rodillo',
            'Flexiona las rodillas llevando talones hacia glúteos',
            'Baja controladamente'
        ],
        tips: ['No despegues las caderas', 'Movimiento controlado', 'Aprieta al llegar arriba'],
        musclesWorked: { primary: ['Isquiotibiales'], secondary: [] }
    },

    // ============ HOMBROS (SHOULDERS) ============
    {
        name: 'Press Militar con Barra',
        category: 'shoulders',
        difficulty: 'intermediate',
        equipment: ['barra'],
        description: 'Ejercicio principal para desarrollar hombros fuertes.',
        instructions: [
            'De pie, sostén la barra a nivel de hombros',
            'Empuja la barra hacia arriba',
            'Extiende completamente los brazos',
            'Baja controladamente'
        ],
        tips: ['Activa el core', 'No arquees la espalda baja', 'Lleva la barra en línea recta'],
        musclesWorked: { primary: ['Deltoides'], secondary: ['Tríceps', 'Trapecio superior'] }
    },
    {
        name: 'Elevaciones Laterales',
        category: 'shoulders',
        difficulty: 'beginner',
        equipment: ['mancuernas'],
        description: 'Ejercicio de aislamiento para el deltoides lateral.',
        instructions: [
            'De pie con una mancuerna en cada mano',
            'Levanta los brazos hacia los lados',
            'Sube hasta la altura de los hombros',
            'Baja controladamente'
        ],
        tips: ['Ligera flexión en codos', 'No uses impulso', 'Controla todo el movimiento'],
        musclesWorked: { primary: ['Deltoides lateral'], secondary: [] }
    },
    {
        name: 'Elevaciones Frontales',
        category: 'shoulders',
        difficulty: 'beginner',
        equipment: ['mancuernas'],
        description: 'Trabaja la parte frontal del hombro.',
        instructions: [
            'De pie con mancuernas frente a los muslos',
            'Levanta los brazos hacia adelante',
            'Sube hasta la altura de los hombros',
            'Baja controladamente'
        ],
        tips: ['No balancees el cuerpo', 'Mantén core activo', 'Palmas hacia abajo'],
        musclesWorked: { primary: ['Deltoides anterior'], secondary: [] }
    },
    {
        name: 'Pájaros (Face Pulls)',
        category: 'shoulders',
        difficulty: 'beginner',
        equipment: ['polea'],
        description: 'Excelente para deltoides posterior y salud del hombro.',
        instructions: [
            'Ajusta la polea a altura de rostro',
            'Agarra la cuerda con ambas manos',
            'Tira hacia tu cara separando las manos',
            'Vuelve controladamente'
        ],
        tips: ['Lleva los codos hacia atrás y arriba', 'Aprieta los omóplatos', 'Mantén el pecho arriba'],
        musclesWorked: { primary: ['Deltoides posterior'], secondary: ['Romboides', 'Trapecio medio'] }
    },

    // ============ BRAZOS (ARMS) ============
    {
        name: 'Curl con Barra',
        category: 'arms',
        difficulty: 'beginner',
        equipment: ['barra'],
        description: 'Ejercicio clásico para bíceps.',
        instructions: [
            'De pie, sostén la barra con palmas hacia arriba',
            'Flexiona los codos llevando la barra hacia arriba',
            'Aprieta los bíceps arriba',
            'Baja controladamente'
        ],
        tips: ['Mantén los codos pegados al cuerpo', 'No balancees', 'Baja completamente'],
        musclesWorked: { primary: ['Bíceps'], secondary: ['Antebrazos'] }
    },
    {
        name: 'Curl con Mancuernas',
        category: 'arms',
        difficulty: 'beginner',
        equipment: ['mancuernas'],
        description: 'Permite trabajar cada brazo independientemente.',
        instructions: [
            'De pie con una mancuerna en cada mano',
            'Flexiona alternando o simultáneamente',
            'Puedes rotar la muñeca al subir',
            'Baja controladamente'
        ],
        tips: ['Mantén el core activo', 'No uses impulso', 'Gira la muñeca para mayor activación'],
        musclesWorked: { primary: ['Bíceps'], secondary: ['Antebrazos'] }
    },
    {
        name: 'Extensión de Tríceps con Polea',
        category: 'arms',
        difficulty: 'beginner',
        equipment: ['polea'],
        description: 'Ejercicio de aislamiento para tríceps.',
        instructions: [
            'De pie frente a la polea alta',
            'Agarra la cuerda o barra',
            'Extiende los brazos hacia abajo',
            'Vuelve controladamente'
        ],
        tips: ['Mantén codos pegados', 'No muevas la parte superior del brazo', 'Extiende completamente'],
        musclesWorked: { primary: ['Tríceps'], secondary: [] }
    },
    {
        name: 'Press Francés',
        category: 'arms',
        difficulty: 'intermediate',
        equipment: ['barra', 'banco'],
        description: 'Ejercicio compuesto para tríceps.',
        instructions: [
            'Acostado, sostén la barra sobre el pecho',
            'Baja la barra hacia la frente flexionando codos',
            'Mantén la parte superior del brazo fija',
            'Extiende hacia arriba'
        ],
        tips: ['Codos apuntando hacia adelante', 'No abras los codos', 'Usa peso moderado'],
        musclesWorked: { primary: ['Tríceps'], secondary: [] }
    },

    // ============ CORE ============
    {
        name: 'Plancha (Plank)',
        category: 'core',
        difficulty: 'beginner',
        equipment: [],
        description: 'Ejercicio isométrico fundamental para el core.',
        instructions: [
            'Apóyate en antebrazos y pies',
            'Mantén el cuerpo en línea recta',
            'Activa abdomen y glúteos',
            'Mantén la posición'
        ],
        tips: ['No dejes caer las caderas', 'Mira al suelo', 'Respira normalmente'],
        musclesWorked: { primary: ['Core', 'Abdominales'], secondary: ['Hombros', 'Glúteos'] }
    },
    {
        name: 'Crunches',
        category: 'core',
        difficulty: 'beginner',
        equipment: [],
        description: 'Ejercicio básico para abdominales.',
        instructions: [
            'Acuéstate boca arriba con rodillas flexionadas',
            'Manos detrás de la cabeza',
            'Levanta los hombros del suelo',
            'Baja controladamente'
        ],
        tips: ['No tires del cuello', 'Exhala al subir', 'Movimiento controlado'],
        musclesWorked: { primary: ['Abdominales'], secondary: [] }
    },
    {
        name: 'Russian Twist',
        category: 'core',
        difficulty: 'intermediate',
        equipment: [],
        description: 'Trabaja los oblicuos con rotación.',
        instructions: [
            'Siéntate con rodillas flexionadas',
            'Inclina el torso hacia atrás',
            'Rota el torso de lado a lado',
            'Puedes sostener peso'
        ],
        tips: ['Mantén el core activo', 'No uses solo los brazos', 'Controla el movimiento'],
        musclesWorked: { primary: ['Oblicuos', 'Core'], secondary: [] }
    },
    {
        name: 'Elevación de Piernas',
        category: 'core',
        difficulty: 'intermediate',
        equipment: [],
        description: 'Trabaja la parte baja del abdomen.',
        instructions: [
            'Acuéstate boca arriba',
            'Manos bajo los glúteos',
            'Levanta las piernas hasta 90 grados',
            'Baja sin tocar el suelo'
        ],
        tips: ['Mantén espalda baja pegada al suelo', 'Piernas rectas o ligeramente flexionadas', 'Movimiento controlado'],
        musclesWorked: { primary: ['Abdomen inferior'], secondary: ['Hip flexors'] }
    },

    // ============ CARDIO ============
    {
        name: 'Carrera/Running',
        category: 'cardio',
        difficulty: 'beginner',
        equipment: ['caminadora o exterior'],
        description: 'Ejercicio cardiovascular fundamental.',
        instructions: [
            'Mantén postura erguida',
            'Aterriza con la parte media del pie',
            'Brazos a 90 grados',
            'Respira rítmicamente'
        ],
        tips: ['Incrementa intensidad gradualmente', 'Usa calzado adecuado', 'Varía la velocidad e inclinación'],
        musclesWorked: { primary: ['Cardiovascular'], secondary: ['Piernas', 'Core'] }
    },
    {
        name: 'Ciclismo',
        category: 'cardio',
        difficulty: 'beginner',
        equipment: ['bicicleta estática o exterior'],
        description: 'Bajo impacto, excelente para resistencia.',
        instructions: [
            'Ajusta el asiento a altura adecuada',
            'Mantén espalda ligeramente inclinada',
            'Pedalea con ritmo constante',
            'Varía la resistencia'
        ],
        tips: ['Rodilla ligeramente flexionada en extensión máxima', 'Varía intensidad', 'Hidratación constante'],
        musclesWorked: { primary: ['Cardiovascular', 'Cuádriceps'], secondary: ['Glúteos', 'Isquiotibiales'] }
    },
    {
        name: 'Remo Ergómetro',
        category: 'cardio',
        difficulty: 'intermediate',
        equipment: ['máquina de remo'],
        description: 'Cardio de cuerpo completo.',
        instructions: [
            'Siéntate con pies asegurados',
            'Agarra el manubrio',
            'Empuja con piernas, luego tira con brazos',
            'Vuelve controladamente'
        ],
        tips: ['Usa las piernas primero', '60% piernas, 20% core, 20% brazos', 'Mantén espalda recta'],
        musclesWorked: { primary: ['Cardiovascular'], secondary: ['Espalda', 'Piernas', 'Brazos'] }
    },

    // ============ FUNCIONAL ============
    {
        name: 'Burpees',
        category: 'functional',
        difficulty: 'intermediate',
        equipment: [],
        description: 'Ejercicio de cuerpo completo que combina fuerza y cardio.',
        instructions: [
            'De pie, baja a posición de cuclillas',
            'Coloca manos en el suelo',
            'Salta hacia plancha',
            'Haz una flexión',
            'Salta hacia adelante',
            'Salta hacia arriba'
        ],
        tips: ['Mantén core activo', 'Aterriza suavemente', 'Modifica si es necesario (sin flexión o sin salto)'],
        musclesWorked: { primary: ['Cuerpo completo'], secondary: ['Cardiovascular'] }
    },
    {
        name: 'Box Jumps',
        category: 'functional',
        difficulty: 'intermediate',
        equipment: ['caja o plataforma'],
        description: 'Desarrolla potencia en piernas.',
        instructions: [
            'Párate frente a la caja',
            'Flexiona rodillas y brazos',
            'Salta explosivamente sobre la caja',
            'Aterriza suavemente',
            'Baja con control'
        ],
        tips: ['Empieza con caja baja', 'Aterriza con pies completos', 'No saltes hacia abajo'],
        musclesWorked: { primary: ['Piernas', 'Glúteos'], secondary: ['Core', 'Potencia'] }
    },
    {
        name: 'Kettlebell Swings',
        category: 'functional',
        difficulty: 'intermediate',
        equipment: ['kettlebell'],
        description: 'Ejercicio balístico que trabaja cadena posterior.',
        instructions: [
            'Pies al ancho de hombros, kettlebell entre piernas',
            'Flexiona caderas y agarra la pesa',
            'Balancea hacia atrás',
            'Impulsa con caderas hacia adelante'
        ],
        tips: ['Movimiento de caderas, no de brazos', 'Mantén espalda recta', 'Aprieta glúteos arriba'],
        musclesWorked: { primary: ['Glúteos', 'Isquiotibiales'], secondary: ['Core', 'Hombros'] }
    }
];
