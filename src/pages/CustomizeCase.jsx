import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import { storage, db } from '../config/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc } from 'firebase/firestore';
import { ExclamationCircleIcon } from '@heroicons/react/24/outline';
import WebFont from 'webfontloader';
import { debounce } from 'lodash';

const CustomizeCase = () => {
  const { user } = useAuth();
  const [layers, setLayers] = useState([]);
  const [selectedLayerIndex, setSelectedLayerIndex] = useState(-1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Efectos de imagen
  const [selectedImage, setSelectedImage] = useState(null);
  const [blendMode, setBlendMode] = useState('normal');
  const [clipPath, setClipPath] = useState(null);
  const [alignmentGuides, setAlignmentGuides] = useState(false);

  // Controles de previsualización
  const [phoneModel, setPhoneModel] = useState('iphone-13');
  const [caseColor, setCaseColor] = useState('#FFFFFF');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);

  const phoneModels = useMemo(() => [    { value: 'iphone-13', label: 'iPhone 13' },    { value: 'iphone-14', label: 'iPhone 14' },    { value: 'samsung-s21', label: 'Samsung S21' },    { value: 'samsung-s22', label: 'Samsung S22' }  ], []);

  const caseColors = useMemo(() => [
    { value: '#FFFFFF', label: 'Blanco' },
    { value: '#000000', label: 'Negro' },
    { value: '#FF0000', label: 'Rojo' },
    { value: '#0000FF', label: 'Azul' },
    { value: '#00FF00', label: 'Verde' }
  ], []);
  
  const blendModes = useMemo(() => [
    { value: 'normal', label: 'Normal' },
    { value: 'multiply', label: 'Multiplicar' },
    { value: 'screen', label: 'Pantalla' },
    { value: 'overlay', label: 'Superponer' },
    { value: 'darken', label: 'Oscurecer' },
    { value: 'lighten', label: 'Aclarar' },
    { value: 'color-dodge', label: 'Sobreexposición' },
    { value: 'color-burn', label: 'Subexposición' },
    { value: 'hard-light', label: 'Luz fuerte' },
    { value: 'soft-light', label: 'Luz suave' },
    { value: 'difference', label: 'Diferencia' },
    { value: 'exclusion', label: 'Exclusión' },
    { value: 'hue', label: 'Tono' },
    { value: 'saturation', label: 'Saturación' },
    { value: 'color', label: 'Color' },
    { value: 'luminosity', label: 'Luminosidad' }
  ], []);

  const clipPaths = [
    { value: null, label: 'Ninguno' },
    { value: 'circle', label: 'Círculo' },
    { value: 'square', label: 'Cuadrado' },
    { value: 'triangle', label: 'Triángulo' },
    { value: 'heart', label: 'Corazón' }
  ];
  const canvasRef = useRef(null);

  const fonts = [
    { name: 'Inter', label: 'Inter (Moderno)' },
    { name: 'Space Grotesk', label: 'Space Grotesk (Tecnológico)' },
    { name: 'Figtree', label: 'Figtree (Clásico)' },
    { name: 'Dancing Script', label: 'Dancing Script (Elegante)' },
    { name: 'Permanent Marker', label: 'Permanent Marker (Graffiti)' },
  ];

  const textEffects = [
    { value: 'none', label: 'Ninguno' },
    { value: 'neon', label: 'Neón' },
    { value: 'metallic', label: 'Metálico' },
    { value: 'gradient', label: 'Degradado' },
    { value: '3d', label: '3D' },
  ];

  const artFilters = [
    { value: 'none', label: 'Ninguno' },
    { value: 'watercolor', label: 'Acuarela' },
    { value: 'oil', label: 'Óleo' },
    { value: 'sketch', label: 'Boceto' },
    { value: 'vintage', label: 'Vintage' },
  ];

  const templates = [
    { id: 'minimal', label: 'Minimalista', thumbnail: '/templates/minimal.svg' },
    { id: 'nature', label: 'Naturaleza', thumbnail: '/templates/nature.svg' },
    { id: 'geometric', label: 'Geométrico', thumbnail: '/templates/geometric.svg' },
    { id: 'abstract', label: 'Abstracto', thumbnail: '/templates/abstract.svg' },
  ];

  useEffect(() => {
    WebFont.load({
      google: {
        families: fonts.map(font => font.name)
      }
    });
  }, []);

  const createLayer = async (file, type = 'image') => {
    if (type === 'image' && (!file || !file.type.startsWith('image/'))) {
      setError('Por favor, selecciona una imagen válida');
      return;
    }

    const newLayer = {
      id: Date.now(),
      type,
      position: { x: 0, y: 0 },
      scale: 1,
      rotation: 0,
      opacity: 100,
      zIndex: layers.length,
      filters: {
        brightness: 100,
        contrast: 100,
        saturation: 100,
        blur: 0
      }
    };

    if (type === 'image') {
      const reader = new FileReader();
      const imageUrl = await new Promise((resolve) => {
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
      newLayer.imageUrl = imageUrl;
      newLayer.blendMode = 'normal';
      newLayer.clipPath = null;
      newLayer.artFilter = 'none';
      newLayer.filterIntensity = 50;
    } else if (type === 'text') {
      newLayer.text = '';
      newLayer.font = 'Inter';
      newLayer.color = '#000000';
      newLayer.shadow = false;
      newLayer.outline = false;
      newLayer.textEffect = 'none';
      newLayer.gradientColors = ['#000000', '#000000'];
      newLayer.effectIntensity = 50;
    }

    setLayers([...layers, newLayer]);
    setSelectedLayerIndex(layers.length);
    setError('');
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    createLayer(file, 'image');
  };

  const addTextLayer = () => {
    createLayer(null, 'text');
  };

  const updateLayer = (index, updates) => {
    const updatedLayers = [...layers];
    updatedLayers[index] = { ...updatedLayers[index], ...updates };
    setLayers(updatedLayers);
  };

  const deleteLayer = (index) => {
    setLayers(layers.filter((_, i) => i !== index));
    setSelectedLayerIndex(-1);
  };

  const moveLayer = (index, direction) => {
    const newIndex = direction === 'up' ? index + 1 : index - 1;
    if (newIndex < 0 || newIndex >= layers.length) return;

    const updatedLayers = [...layers];
    [updatedLayers[index], updatedLayers[newIndex]] = [updatedLayers[newIndex], updatedLayers[index]];
    setLayers(updatedLayers);
    setSelectedLayerIndex(newIndex);
  };

  const handleMouseDown = (e) => {
    if (e.button === 1 || (e.button === 0 && e.altKey)) { // Botón medio o Alt + Click izquierdo
      setIsPanning(true);
      setDragStart({ x: e.clientX, y: e.clientY });
      return;
    }

    if (selectedLayerIndex === -1) return;
    setIsDragging(true);
    const layer = layers[selectedLayerIndex];
    setDragStart({
      x: e.clientX - layer.position.x * zoomLevel,
      y: e.clientY - layer.position.y * zoomLevel
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsPanning(false);
  };

  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const delta = e.deltaY * -0.01;
    const newZoom = Math.min(Math.max(zoomLevel + delta, 0.5), 3);
    setZoomLevel(newZoom);
  }, [zoomLevel]);

  const applyTextEffect = (context, layer) => {
    switch (layer.textEffect) {
      case 'neon':
        context.shadowBlur = 20 * (layer.effectIntensity / 100);
        context.shadowColor = layer.color;
        break;
      case 'metallic':
        const gradient = context.createLinearGradient(0, 0, 0, context.measureText(layer.text).width);
        gradient.addColorStop(0, '#A1A1A1');
        gradient.addColorStop(0.5, '#FFFFFF');
        gradient.addColorStop(1, '#808080');
        context.fillStyle = gradient;
        break;
      case 'gradient':
        const textGradient = context.createLinearGradient(0, 0, context.measureText(layer.text).width, 0);
        textGradient.addColorStop(0, layer.gradientColors[0]);
        textGradient.addColorStop(1, layer.gradientColors[1]);
        context.fillStyle = textGradient;
        break;
      case '3d':
        const depth = Math.floor(10 * (layer.effectIntensity / 100));
        for (let i = 0; i < depth; i++) {
          context.fillStyle = `rgba(0, 0, 0, ${0.1 * (depth - i)})`;
          context.fillText(layer.text, -i, -i);
        }
        context.fillStyle = layer.color;
        break;
      default:
        context.fillStyle = layer.color;
    }
  };

  const applyArtFilter = (context, layer) => {
    switch (layer.artFilter) {
      case 'watercolor':
        context.filter = `blur(${layer.filterIntensity / 10}px) saturate(150%)`;
        break;
      case 'oil':
        context.filter = `contrast(150%) saturate(120%) brightness(${100 + layer.filterIntensity}%)`;
        break;
      case 'sketch':
        context.filter = `grayscale(100%) contrast(${150 + layer.filterIntensity}%)`;
        break;
      case 'vintage':
        context.filter = `sepia(${layer.filterIntensity}%) contrast(120%)`;
        break;
      default:
        context.filter = 'none';
    }
  };

  const loadTemplate = (templateId) => {
    const templateLayers = {
      minimal: [
        { type: 'text', text: 'Minimal', font: 'Inter', color: '#000000', position: { x: 0, y: 0 } }
      ],
      nature: [
        { type: 'image', imageUrl: '/templates/nature-bg.svg', position: { x: 0, y: 0 } },
        { type: 'text', text: 'Nature', font: 'Dancing Script', color: '#2E7D32', position: { x: 0, y: 50 } }
      ],
      geometric: [
        { type: 'image', imageUrl: '/templates/geometric-pattern.svg', position: { x: 0, y: 0 } }
      ],
      abstract: [
        { type: 'image', imageUrl: '/templates/abstract-shapes.svg', position: { x: 0, y: 0 } },
        { type: 'text', text: 'Abstract', font: 'Space Grotesk', color: '#1976D2', position: { x: 0, y: -50 } }
      ]
    };

    const newLayers = templateLayers[templateId].map(layer => ({
      ...layer,
      id: Date.now() + Math.random(),
      scale: 1,
      rotation: 0,
      opacity: 100,
      zIndex: layers.length,
      filters: {
        brightness: 100,
        contrast: 100,
        saturation: 100,
        blur: 0
      },
      textEffect: layer.type === 'text' ? 'none' : undefined,
      artFilter: layer.type === 'image' ? 'none' : undefined,
      effectIntensity: 50,
      filterIntensity: 50,
      gradientColors: layer.type === 'text' ? ['#000000', '#000000'] : undefined
    }));

    setLayers([...layers, ...newLayers]);
  };

  const getClipPathValue = (type) => {
    switch (type) {
      case 'circle':
        return 'circle(50% at 50% 50%)';
      case 'square':
        return 'polygon(0 0, 100% 0, 100% 100%, 0 100%)';
      case 'triangle':
        return 'polygon(50% 0%, 100% 100%, 0% 100%)';
      case 'heart':
        return 'path("M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402M12 21.593z")';
      default:
        return 'none';
    }
  };

  const handleMouseMove = useCallback(
    debounce((e) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const rect = canvas.getBoundingClientRect();

      if (isPanning) {
        const deltaX = (e.clientX - dragStart.x) / zoomLevel;
        const deltaY = (e.clientY - dragStart.y) / zoomLevel;
        setPanPosition({
          x: panPosition.x + deltaX,
          y: panPosition.y + deltaY
        });
        setDragStart({ x: e.clientX, y: e.clientY });
        return;
      }

      if (!isDragging || selectedLayerIndex === -1) return;
      
      let newX = (e.clientX - dragStart.x) / zoomLevel;
      let newY = (e.clientY - dragStart.y) / zoomLevel;

      // Implementar guías de alineación
      if (alignmentGuides) {
        const centerX = rect.width / (2 * zoomLevel);
        const centerY = rect.height / (2 * zoomLevel);

        const snapThreshold = 10 / zoomLevel;

        // Alinear al centro horizontal
        if (Math.abs(newX - centerX) < snapThreshold) {
          newX = centerX;
        }

        // Alinear al centro vertical
        if (Math.abs(newY - centerY) < snapThreshold) {
          newY = centerY;
        }

        // Alinear con otras capas
        layers.forEach((layer, i) => {
          if (i !== selectedLayerIndex) {
            // Alinear horizontalmente
            if (Math.abs(newX - layer.position.x) < snapThreshold) {
              newX = layer.position.x;
            }
            // Alinear verticalmente
            if (Math.abs(newY - layer.position.y) < snapThreshold) {
              newY = layer.position.y;
            }
          }
        });
      }

      updateLayer(selectedLayerIndex, { position: { x: newX, y: newY } });
    }, 16), // 60fps
    [isPanning, isDragging, selectedLayerIndex, dragStart, zoomLevel, alignmentGuides, layers, panPosition]
  );

  const handleScaleChange = (e, index) => {
    updateLayer(index, { scale: parseFloat(e.target.value) });
  };

  const handleRotationChange = (e, index) => {
    updateLayer(index, { rotation: parseInt(e.target.value) });
  };

  const handleOpacityChange = (e, index) => {
    updateLayer(index, { opacity: parseInt(e.target.value) });
  };

  const handleFilterChange = (index, filterType, value) => {
    const layer = layers[index];
    updateLayer(index, {
      filters: { ...layer.filters, [filterType]: value }
    });
  };

  // Cache de imágenes para mejorar el rendimiento
  const imageCache = useRef(new Map());

  const loadImage = useCallback(async (src) => {
    if (imageCache.current.has(src)) {
      return imageCache.current.get(src);
    }

    const img = new Image();
    const imagePromise = new Promise((resolve, reject) => {
      img.onload = () => resolve(img);
      img.onerror = reject;
    });
    img.src = src;
    imageCache.current.set(src, imagePromise);
    return imagePromise;
  }, []);

  const saveDesign = async () => {
    if (!layers.length || !user) return;

    setLoading(true);
    setError('');

    try {
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      const phoneCase = await loadImage('/phone-case-template.png');

      canvas.width = phoneCase.width;
      canvas.height = phoneCase.height;
      context.drawImage(phoneCase, 0, 0);

      // Dibujar todas las capas en orden
      for (const layer of [...layers].reverse()) {
        context.save();

        // Aplicar posición, rotación y escala
        context.translate(layer.position.x + canvas.width / 2, layer.position.y + canvas.height / 2);
        context.rotate(layer.rotation * Math.PI / 180);
        context.scale(layer.scale, layer.scale);

        // Aplicar opacidad
        context.globalAlpha = layer.opacity / 100;

        if (layer.type === 'image') {
          try {
            const img = await loadImage(layer.imageUrl);
            // Aplicar filtros
            context.filter = `
              brightness(${layer.filters.brightness}%)
              contrast(${layer.filters.contrast}%)
              saturate(${layer.filters.saturation}%)
              blur(${layer.filters.blur}px)
            `;
            context.drawImage(img, -img.width / 2, -img.height / 2);
          } catch (error) {
            console.error('Error al cargar imagen:', error);
          }
        } else if (layer.type === 'text' && layer.text) {
          // Configurar estilo del texto
          context.font = `bold 48px ${layer.font}`;
          context.textAlign = 'center';
          context.textBaseline = 'middle';

          if (layer.outline) {
            context.strokeStyle = layer.color;
            context.lineWidth = 2;
            context.strokeText(layer.text, 0, 0);
          }

          if (layer.shadow) {
            context.shadowColor = 'rgba(0, 0, 0, 0.5)';
            context.shadowBlur = 4;
            context.shadowOffsetX = 2;
            context.shadowOffsetY = 2;
          }

          context.fillStyle = layer.color;
          context.fillText(layer.text, 0, 0);
        }

        context.restore();
      }

      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
      const designRef = ref(storage, `designs/${user.uid}/${Date.now()}.png`);
      await uploadBytes(designRef, blob);
      const downloadURL = await getDownloadURL(designRef);

      await addDoc(collection(db, 'designs'), {
        userId: user.uid,
        imageUrl: downloadURL,
        createdAt: new Date().toISOString(),
        layers: layers.map(layer => ({
          ...layer,
          imageUrl: undefined // No guardamos las URLs de datos en Firestore
        }))
      });

      setError('¡Diseño guardado exitosamente!');
    } catch (error) {
      setError('Error al guardar el diseño: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.addEventListener('wheel', handleWheel, { passive: false });
    return () => canvas.removeEventListener('wheel', handleWheel);
  }, []);

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-slate-blue dark:text-light-darker mb-8">
          Personaliza tu Carcasa
        </h1>

        <div className="relative mb-8 bg-white dark:bg-dark rounded-lg shadow overflow-hidden">
          <div
            className="w-full aspect-[9/16] relative overflow-hidden"
            style={{
              backgroundColor: caseColor,
              cursor: isPanning ? 'grabbing' : isDragging ? 'grabbing' : 'grab'
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <canvas
              ref={canvasRef}
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
              style={{
                transform: `translate(-50%, -50%) translate(${panPosition.x}px, ${panPosition.y}px) scale(${zoomLevel})`,
                transformOrigin: 'center center'
              }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            {/* Panel de Previsualización */}
            <div className="bg-white dark:bg-dark rounded-lg shadow p-4">
              <h2 className="text-xl font-bold text-slate-blue dark:text-light-darker mb-4">
                Previsualización
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-blue dark:text-light-darker mb-2">
                    Modelo de Teléfono
                  </label>
                  <select
                    value={phoneModel}
                    onChange={(e) => setPhoneModel(e.target.value)}
                    className="block w-full rounded-md border-0 py-1.5 px-3 bg-white dark:bg-dark text-slate-blue dark:text-light-darker ring-1 ring-inset ring-slate-blue/10 focus:ring-2 focus:ring-inset focus:ring-primary dark:focus:ring-accent-2 sm:text-sm sm:leading-6"
                  >
                    {phoneModels.map((model) => (
                      <option key={model.value} value={model.value}>
                        {model.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-blue dark:text-light-darker mb-2">
                    Color de Carcasa
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {caseColors.map((color) => (
                      <button
                        key={color.value}
                        onClick={() => setCaseColor(color.value)}
                        className={`w-8 h-8 rounded-full border-2 ${caseColor === color.value ? 'border-primary dark:border-accent-2' : 'border-transparent'}`}
                        style={{ backgroundColor: color.value }}
                        title={color.label}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-blue dark:text-light-darker mb-2">
                    Zoom: {Math.round(zoomLevel * 100)}%
                  </label>
                  <input
                    type="range"
                    min="50"
                    max="300"
                    value={zoomLevel * 100}
                    onChange={(e) => setZoomLevel(e.target.value / 100)}
                    className="w-full"
                  />
                  <p className="text-xs text-slate-blue/60 dark:text-light-darker/60 mt-1">
                    Usa la rueda del ratón o Alt + Click para hacer zoom y desplazarte
                  </p>
                </div>
              </div>
            </div>

            {/* Panel de Plantillas */}
            <div className="bg-white dark:bg-dark rounded-lg shadow p-4 mb-8">
              <h2 className="text-xl font-bold text-slate-blue dark:text-light-darker mb-4">
                Plantillas Prediseñadas
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {templates.map(template => (
                  <button
                    key={template.id}
                    className="p-2 rounded-lg border-2 border-transparent hover:border-primary dark:hover:border-accent-2 transition-colors"
                    onClick={() => loadTemplate(template.id)}
                  >
                    <img
                      src={template.thumbnail}
                      alt={template.label}
                      className="w-full h-24 object-cover rounded"
                    />
                    <p className="mt-2 text-sm text-slate-blue dark:text-light-darker text-center">
                      {template.label}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Panel de Capas */}
            <div className="bg-white dark:bg-dark rounded-lg shadow p-4">
              <h2 className="text-xl font-bold text-slate-blue dark:text-light-darker mb-4">
                Capas
              </h2>
              <div className="mb-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={alignmentGuides}
                    onChange={(e) => setAlignmentGuides(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-blue/10 text-primary focus:ring-primary dark:focus:ring-accent-2"
                  />
                  <label className="ml-2 text-sm text-slate-blue dark:text-light-darker">
                    Mostrar guías de alineación
                  </label>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <button
                    onClick={() => document.getElementById('image-upload').click()}
                    className="flex-1 justify-center rounded-md bg-primary dark:bg-accent-2 px-3 py-2 text-sm font-semibold text-white hover:bg-primary/90 dark:hover:bg-accent-2/90"
                  >
                    Añadir Imagen
                  </button>
                  <button
                    onClick={addTextLayer}
                    className="flex-1 justify-center rounded-md bg-primary dark:bg-accent-2 px-3 py-2 text-sm font-semibold text-white hover:bg-primary/90 dark:hover:bg-accent-2/90"
                  >
                    Añadir Texto
                  </button>
                </div>
                <input
                  type="file"
                  id="image-upload"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />

                {/* Lista de Capas */}
                <div className="space-y-2">
                  {layers.map((layer, index) => (
                    <div
                      key={layer.id}
                      className={`p-3 rounded-lg cursor-pointer ${selectedLayerIndex === index ? 'bg-primary/10 dark:bg-accent-2/10' : 'bg-light-darker dark:bg-slate-blue/20'}`}
                      onClick={() => setSelectedLayerIndex(index)}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-blue dark:text-light-darker">
                          {layer.type === 'image' ? 'Imagen' : 'Texto'} {index + 1}
                        </span>
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              moveLayer(index, 'up');
                            }}
                            className="text-sm text-slate-blue/60 dark:text-light-darker/60 hover:text-primary dark:hover:text-accent-2"
                            disabled={index === layers.length - 1}
                          >
                            ↑
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              moveLayer(index, 'down');
                            }}
                            className="text-sm text-slate-blue/60 dark:text-light-darker/60 hover:text-primary dark:hover:text-accent-2"
                            disabled={index === 0}
                          >
                            ↓
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteLayer(index);
                            }}
                            className="text-sm text-red-500 hover:text-red-600"
                          >
                            ×
                          </button>
                        </div>
                      </div>

                      {selectedLayerIndex === index && (
                        <div className="mt-4 space-y-4">
                          {layer.type === 'text' && (
                            <>
                              <div>
                                <label className="block text-sm font-medium text-slate-blue dark:text-light-darker mb-2">
                                  Efecto de Texto
                                </label>
                                <select
                                  value={layer.textEffect}
                                  onChange={(e) => updateLayer(index, { textEffect: e.target.value })}
                                  className="block w-full rounded-md border-0 py-1.5 px-3 bg-white dark:bg-dark text-slate-blue dark:text-light-darker ring-1 ring-inset ring-slate-blue/10 focus:ring-2 focus:ring-inset focus:ring-primary dark:focus:ring-accent-2 sm:text-sm sm:leading-6"
                                >
                                  {textEffects.map(effect => (
                                    <option key={effect.value} value={effect.value}>
                                      {effect.label}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              {layer.textEffect === 'gradient' && (
                                <div>
                                  <label className="block text-sm font-medium text-slate-blue dark:text-light-darker mb-2">
                                    Colores del Degradado
                                  </label>
                                  <div className="flex gap-2">
                                    <input
                                      type="color"
                                      value={layer.gradientColors[0]}
                                      onChange={(e) => {
                                        const newColors = [...layer.gradientColors];
                                        newColors[0] = e.target.value;
                                        updateLayer(index, { gradientColors: newColors });
                                      }}
                                      className="h-8 w-16"
                                    />
                                    <input
                                      type="color"
                                      value={layer.gradientColors[1]}
                                      onChange={(e) => {
                                        const newColors = [...layer.gradientColors];
                                        newColors[1] = e.target.value;
                                        updateLayer(index, { gradientColors: newColors });
                                      }}
                                      className="h-8 w-16"
                                    />
                                  </div>
                                </div>
                              )}

                              <div>
                                <label className="block text-sm font-medium text-slate-blue dark:text-light-darker mb-2">
                                  Intensidad del Efecto: {layer.effectIntensity}%
                                </label>
                                <input
                                  type="range"
                                  min="0"
                                  max="100"
                                  value={layer.effectIntensity}
                                  onChange={(e) => updateLayer(index, { effectIntensity: parseInt(e.target.value) })}
                                  className="w-full"
                                />
                              </div>
                            </>
                          )}

                          {layer.type === 'image' && (
                            <>
                              <div>
                                <label className="block text-sm font-medium text-slate-blue dark:text-light-darker mb-2">
                                  Filtro Artístico
                                </label>
                                <select
                                  value={layer.artFilter}
                                  onChange={(e) => updateLayer(index, { artFilter: e.target.value })}
                                  className="block w-full rounded-md border-0 py-1.5 px-3 bg-white dark:bg-dark text-slate-blue dark:text-light-darker ring-1 ring-inset ring-slate-blue/10 focus:ring-2 focus:ring-inset focus:ring-primary dark:focus:ring-accent-2 sm:text-sm sm:leading-6"
                                >
                                  {artFilters.map(filter => (
                                    <option key={filter.value} value={filter.value}>
                                      {filter.label}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-slate-blue dark:text-light-darker mb-2">
                                  Intensidad del Filtro: {layer.filterIntensity}%
                                </label>
                                <input
                                  type="range"
                                  min="0"
                                  max="100"
                                  value={layer.filterIntensity}
                                  onChange={(e) => updateLayer(index, { filterIntensity: parseInt(e.target.value) })}
                                  className="w-full"
                                />
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Panel de Edición de Capa */}
            {selectedLayerIndex !== -1 && (
              <div className="bg-white dark:bg-dark rounded-lg shadow p-4">
                <h2 className="text-xl font-bold text-slate-blue dark:text-light-darker mb-4">
                  Editar {layers[selectedLayerIndex].type === 'image' ? 'Imagen' : 'Texto'}
                </h2>

                {/* Controles específicos para texto */}
                {layers[selectedLayerIndex].type === 'text' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-blue dark:text-light-darker mb-2">
                        Texto
                      </label>
                      <input
                        type="text"
                        value={layers[selectedLayerIndex].text}
                        onChange={(e) => updateLayer(selectedLayerIndex, { text: e.target.value })}
                        className="block w-full rounded-md border-0 py-1.5 px-3 bg-white dark:bg-dark text-slate-blue dark:text-light-darker ring-1 ring-inset ring-slate-blue/10 placeholder:text-slate-blue/60 dark:placeholder:text-light-darker/60 focus:ring-2 focus:ring-inset focus:ring-primary dark:focus:ring-accent-2 sm:text-sm sm:leading-6"
                        placeholder="Escribe tu texto aquí"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-blue dark:text-light-darker mb-2">
                        Tipografía
                      </label>
                      <select
                        value={layers[selectedLayerIndex].font}
                        onChange={(e) => updateLayer(selectedLayerIndex, { font: e.target.value })}
                        className="block w-full rounded-md border-0 py-1.5 px-3 bg-white dark:bg-dark text-slate-blue dark:text-light-darker ring-1 ring-inset ring-slate-blue/10 focus:ring-2 focus:ring-inset focus:ring-primary dark:focus:ring-accent-2 sm:text-sm sm:leading-6"
                      >
                        {fonts.map((font) => (
                          <option key={font.name} value={font.name}>
                            {font.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-blue dark:text-light-darker mb-2">
                        Color
                      </label>
                      <input
                        type="color"
                        value={layers[selectedLayerIndex].color}
                        onChange={(e) => updateLayer(selectedLayerIndex, { color: e.target.value })}
                        className="block w-full h-10 rounded-md border-0 bg-white dark:bg-dark ring-1 ring-inset ring-slate-blue/10 focus:ring-2 focus:ring-inset focus:ring-primary dark:focus:ring-accent-2"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={layers[selectedLayerIndex].shadow}
                          onChange={(e) => updateLayer(selectedLayerIndex, { shadow: e.target.checked })}
                          className="h-4 w-4 rounded border-slate-blue/10 text-primary focus:ring-primary dark:focus:ring-accent-2"
                        />
                        <label className="ml-2 text-sm text-slate-blue dark:text-light-darker">
                          Sombra
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={layers[selectedLayerIndex].outline}
                          onChange={(e) => updateLayer(selectedLayerIndex, { outline: e.target.checked })}
                          className="h-4 w-4 rounded border-slate-blue/10 text-primary focus:ring-primary dark:focus:ring-accent-2"
                        />
                        <label className="ml-2 text-sm text-slate-blue dark:text-light-darker">
                          Contorno
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {/* Controles para todas las capas */}
                <div className="space-y-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-blue dark:text-light-darker mb-2">
                      Escala: {layers[selectedLayerIndex].scale.toFixed(2)}x
                    </label>
                    <input
                      type="range"
                      min="0.1"
                      max="2"
                      step="0.1"
                      value={layers[selectedLayerIndex].scale}
                      onChange={(e) => handleScaleChange(e, selectedLayerIndex)}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-blue dark:text-light-darker mb-2">
                      Rotación: {layers[selectedLayerIndex].rotation}°
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="360"
                      value={layers[selectedLayerIndex].rotation}
                      onChange={(e) => handleRotationChange(e, selectedLayerIndex)}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-blue dark:text-light-darker mb-2">
                      Opacidad: {layers[selectedLayerIndex].opacity}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={layers[selectedLayerIndex].opacity}
                      onChange={(e) => handleOpacityChange(e, selectedLayerIndex)}
                      className="w-full"
                    />
                  </div>

                  {layers[selectedLayerIndex].type === 'image' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-blue dark:text-light-darker mb-2">
                          Modo de Fusión
                        </label>
                        <select
                          value={layers[selectedLayerIndex].blendMode}
                          onChange={(e) => updateLayer(selectedLayerIndex, { blendMode: e.target.value })}
                          className="block w-full rounded-md border-0 py-1.5 px-3 bg-white dark:bg-dark text-slate-blue dark:text-light-darker ring-1 ring-inset ring-slate-blue/10 focus:ring-2 focus:ring-inset focus:ring-primary dark:focus:ring-accent-2 sm:text-sm sm:leading-6"
                        >
                          {blendModes.map((mode) => (
                            <option key={mode.value} value={mode.value}>
                              {mode.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-blue dark:text-light-darker mb-2">
                          Máscara de Recorte
                        </label>
                        <select
                          value={layers[selectedLayerIndex].clipPath}
                          onChange={(e) => updateLayer(selectedLayerIndex, { clipPath: e.target.value })}
                          className="block w-full rounded-md border-0 py-1.5 px-3 bg-white dark:bg-dark text-slate-blue dark:text-light-darker ring-1 ring-inset ring-slate-blue/10 focus:ring-2 focus:ring-inset focus:ring-primary dark:focus:ring-accent-2 sm:text-sm sm:leading-6"
                        >
                          {clipPaths.map((clip) => (
                            <option key={clip.value || 'none'} value={clip.value}>
                              {clip.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-blue dark:text-light-darker mb-2">
                          Brillo: {layers[selectedLayerIndex].filters.brightness}%
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="200"
                          value={layers[selectedLayerIndex].filters.brightness}
                          onChange={(e) => handleFilterChange(selectedLayerIndex, 'brightness', parseInt(e.target.value))}
                          className="w-full"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-blue dark:text-light-darker mb-2">
                          Contraste: {layers[selectedLayerIndex].filters.contrast}%
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="200"
                          value={layers[selectedLayerIndex].filters.contrast}
                          onChange={(e) => handleFilterChange(selectedLayerIndex, 'contrast', parseInt(e.target.value))}
                          className="w-full"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-blue dark:text-light-darker mb-2">
                          Saturación: {layers[selectedLayerIndex].filters.saturation}%
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="200"
                          value={layers[selectedLayerIndex].filters.saturation}
                          onChange={(e) => handleFilterChange(selectedLayerIndex, 'saturation', parseInt(e.target.value))}
                          className="w-full"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-blue dark:text-light-darker mb-2">
                          Desenfoque: {layers[selectedLayerIndex].filters.blur}px
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="10"
                          value={layers[selectedLayerIndex].filters.blur}
                          onChange={(e) => handleFilterChange(selectedLayerIndex, 'blur', parseInt(e.target.value))}
                          className="w-full"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <button
              onClick={saveDesign}
              disabled={!layers.length || loading}
              className="w-full justify-center rounded-md bg-primary dark:bg-accent-2 px-3 py-2 text-sm font-semibold text-white
                hover:bg-primary/90 dark:hover:bg-accent-2/90
                focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2
                focus-visible:outline-primary dark:focus-visible:outline-accent-2
                disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Guardando...' : 'Guardar Diseño'}
            </button>
          </div>

          <div
            className="relative aspect-[9/16] bg-white dark:bg-dark rounded-lg shadow-md overflow-hidden"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full"
              style={{ display: 'none' }}
            />
            <div className="relative w-full h-full">
              <img
                src="/phone-case-template.png"
                alt="Phone Case Template"
                className="absolute inset-0 w-full h-full object-contain"
              />
              {layers.map((layer, index) => (
                <div
                  key={layer.id}
                  className={`absolute inset-0 flex items-center justify-center ${selectedLayerIndex === index ? 'cursor-move' : ''}`}
                  style={{
                    zIndex: layer.zIndex + 1,
                    opacity: layer.opacity / 100,
                    transform: `
                      translate(${layer.position.x}px, ${layer.position.y}px)
                      rotate(${layer.rotation}deg)
                      scale(${layer.scale})
                    `,
                    filter: layer.type === 'image' ? `
                      brightness(${layer.filters.brightness}%)
                      contrast(${layer.filters.contrast}%)
                      saturate(${layer.filters.saturation}%)
                      blur(${layer.filters.blur}px)
                    ` : 'none',
                    mixBlendMode: layer.type === 'image' ? layer.blendMode : 'normal',
                    clipPath: layer.type === 'image' && layer.clipPath ? getClipPathValue(layer.clipPath) : 'none'
                  }}
                >
                  {layer.type === 'image' ? (
                    <img
                      src={layer.imageUrl}
                      alt={`Capa ${index + 1}`}
                      className="max-w-full max-h-full object-contain"
                    />
                  ) : (
                    <div
                      style={{
                        color: layer.color,
                        fontFamily: layer.font,
                        fontSize: '48px',
                        fontWeight: 'bold',
                        textShadow: layer.shadow ? '2px 2px 4px rgba(0, 0, 0, 0.5)' : 'none',
                        WebkitTextStroke: layer.outline ? `2px ${layer.color}` : 'none'
                      }}
                    >
                      {layer.text}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-6 rounded-md bg-red-50 dark:bg-red-900/30 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <ExclamationCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">{error}</h3>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomizeCase;