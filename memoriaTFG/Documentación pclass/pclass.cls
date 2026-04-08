\NeedsTeXFormat{LaTeX2e}
\ProvidesClass{pclass}[2008/09/08 PFC class Universidad de Sevilla]
\DeclareOption{openright}{ \PassOptionsToClass{openright}{book} }
\DeclareOption{openany}{ \PassOptionsToClass{openany}{book} }
\DeclareOption{twoside}{ \PassOptionsToClass{twoside}{book} }
\DeclareOption{oneside}{ \PassOptionsToClass{oneside}{book} }
\ExecuteOptions{twoside,openright}

\ProcessOptions 

\LoadClass[a4paper,11pt]{book}

\textwidth=350pt
\textheight=600pt
\marginparwidth=100pt

% Set equal margins on book style
%\setlength{\oddsidemargin}{53pt}
%\setlength{\evensidemargin}{53pt}
%\setlength{\marginparwidth}{57pt}
%\setlength{\footskip}{30pt}



\RequirePackage {graphicx}
\RequirePackage[utf8]{inputenc} 

\RequirePackage[spanish,activeacute]{babel}

%\usepackage{palatino}
%\usepackage{newcent}   
%\usepackage{courier}
%\usepackage{helvet}
\usepackage{url}
\RequirePackage{amsmath,amsthm,amssymb,latexsym}

\usepackage{symbols}%para manual.tex cuadro comandos
\usepackage{bbding}%para ArrowBold

%\RequirePackage {titlesec}%Modifica titulos de sección
\usepackage[clearempty,pagestyles,newparttoc]{titlesec}
%\usepackage{titlesec}
\usepackage{titletoc}

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% ÍNDICE AÑADIDO %%%%%%%%%%%%%%%%%%%%%%%%%%
\usepackage{tocbibind}%paquete hace que aparezcan en la tabla de contenidos cosas que normalmente no aparecen, como el índice, la bibliografía, las listas de cuadros o figuras, o la propia tabla de contenidos
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
\usepackage[spanish]{layout}%para \layout en capitulo 3 fancyhdr doc OPCINAL PARA CLS
\usepackage{boxedminipage}%para \boxedminpage,\fblock en capitulo 3 fancyhdr para hcer los cuadros doc OPCINAL PARA CLS
\usepackage{multicol}
\usepackage{color}
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%para código fuente%%%%%%%%%%%%%%%%%%%%%
\usepackage{listings}
% Definiendo colores para los listados de código fuente
\definecolor{violet}{rgb}{0.5,0,0.5}
\definecolor{shadow}{rgb}{0.5,0.4,0.5}

\definecolor{hellgelb}{rgb}{1,1,0.8}
\definecolor{colKeys}{rgb}{0.6,0.15,0}
\definecolor{colIdentifier}{rgb}{0.7,0.1,0}
\definecolor{colComments}{cmyk}{0,0.3,0.99,0.25}
%\definecolor{colComments}{rgb}{0,0,1}
\definecolor{colString}{rgb}{0,0.5,0}

\lstset{
	framexleftmargin=5mm, 
	frame=shadowbox, 
	rulesepcolor=\color{shadow},
        float=hbp,
        basicstyle=\ttfamily\small,
        identifierstyle=\color{colIdentifier},
        keywordstyle=\color{colKeys},
        stringstyle=\color{colString},
        commentstyle=\color{colComments},
        columns=flexible,
        tabsize=4,
        %frame=single,
        extendedchars=true,
        showspaces=false,
        showstringspaces=false,
        numbers=left,
        numberstyle=\tiny,
        breaklines=true,
        backgroundcolor=\color{hellgelb},
        breakautoindent=true,
        captionpos=b
}
% Listados de código fuente
\renewcommand{\lstlistlistingname}{Índice de código}
\renewcommand{\lstlistingname}{Código}

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%para código fuente%%%%%%%%%%%%
%1º Lenguaje según la tabla de opciones.
%2º Título de la captura de código
%3º Ruta del archivo
\newcommand{\codigofuente}[3]{
  \lstinputlisting[language=#1,caption={#2}]{#3} 
}

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%


%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% CABECERAS DE PÁGINAS %%%%%%%%%%%%%%%%%%%
\usepackage{fancyhdr}
\pagestyle{fancy}
\fancyhead{} %Para limpiar las cabeceras de páginas
%\fancyhead[LE,RO]{\slshape \nouppercase \rightmark}
%\fancyhead[RO]{\slshape \nouppercase \leftmark}
%\fancyhead[RO]{\leftmark}
%\fancyfoot[C]{}
\fancyhead[LO]{\bfseries\slshape\nouppercase\rightmark}%Cabecera Izquierda páginas Impares Sección acutal (Left field Odd)
\fancyhead[RE]{\bfseries\slshape\nouppercase\leftmark}%Cabecera Derecha página Pares Sección acutal (Right field Even)
\fancyfoot{}%Para limpiar los pies de páginas
\fancyhead[LE,RO]{\bfseries\thepage}%Números de páginas en cabecera
\renewcommand{\headrulewidth}{0.4pt}%Línea de cabecera
\renewcommand{\footrulewidth}{0.0pt}%Línea de pie  de página

\renewcommand{\chaptermark}[1]{\markboth{\thechapter.\ #1}{}}%Cabecera de capítulo de la forma ``1. Introduccion''
\renewcommand{\sectionmark}[1]{\markright{\thesection.\ #1}}%Si “Sección 2.2. Primeros pasos” es la sección acutal,este comando nos cambia a ``2.2. Primeros pasos'' 
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%


\def\latex/{\protect\LaTeX{}}%posible script
\def\tex/{\TeX{}}%posible script
\newcommand\latexdos{\LaTeX~2.09~}
%%%%%%%%%%%%%%%%%%%%%%%%%%% Script para escribir un solo comando %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
\newcommand{\bs}{\symbol{'134}}
\newcommand{\Cmd}[1]{\texttt{\def\{{\char`\{}\def\}{\char`\}}\bs#1}}%para insertar comando el letra diferente
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% Script para crear un cuadro %%%%%%%%%%%%%%%%%%%%%%%%%%%
\newenvironment{block}{\vspace{8pt}\begin{minipage}{\textwidth}}{\end{minipage}\vspace{8pt}}
\newenvironment{fblock}{\vspace{8pt}\begin{boxedminipage}{\textwidth}}{\end{boxedminipage}\vspace{8pt}}
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%


%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% DATOS DE PORTADA %%%%%%%%%%%%%%%%%%%%%%%%%%%
\newcommand{\autores}[2]{\def\@autorUno{#1}\def\@autorDos{#2}}%%%% MACRO PARA PONER 2 AUTORES

\newcommand{\autor}[1]{\def\@autorUno{#1}}%variable autor
\newcommand{\@authorUno}{\ClassError{pclass}{Falta especificar \string\autor{}
\MessageBreak Usa el comando \string\autor{} en el preambulo 
\MessageBreakpara especificar tu nombre.
}}


\newcommand{\titulacion}[1]{\def\@titulacion{#1}}%vble titulacion
\newcommand{\@titulacion}{\ClassError{pclass}{Falta especificar \string\titulacion{} 
\MessageBreak Usa el comando \string\titulacion{} en el preambulo para 
\MessageBreak especificar la titulacion que cursas. 
}}


\newcommand{\titulopro}[1]{\def\@titulopro{#1}}%vble titulo del proyecto
\newcommand{\@titulopro}{\ClassError{pclass}{Falta especificar \string\titulopro{} 
\MessageBreak Usa el comando \string\titulopro{} en el preambulo para 
\MessageBreak especificar el titulo de tu proyecto. 
}}
 

\newcommand{\tutor}[1]{\def\@tutor{#1}}%vble tutor
\newcommand{\@tutor}{\ClassError{pclass}{Falta especificar \string\tutor{} 
\MessageBreak Usa el comando \string\tutor{} en el preambulo para 
\MessageBreak especificar el nombre del tutor de tu proyecto. 
}}


\newcommand{\departamento}[1]{\def\@departamento{#1}}%vble departamento
\newcommand{\@departamento}{\ClassError{pclass}{Falta especificar \string\departamento{} 
\MessageBreak Usa el comando \string\departamento{} en el preambulo para 
\MessageBreak especificar el departamento al que pertenece tu proyecto. 
}}


\newcommand{\dia}[1]{\def\@diad{#1}}
\newcommand{\@diad}{\ClassError{pclass}{Falta especificar \string\dia{} 
\MessageBreak Usa el comando \string\dia{} en el preambulo para 
\MessageBreak especificar la fecha de presentacion de tu proyecto. 
}}
% Usa \cdpchapter para todos los capitulos que comienzen "a la derecha"
% Y no tienen numero (p.e. los Agradecimientos):
%\newcommand{\cdpchapter}[1]{\cleardoublepage\chapter*{#1}}
\newcommand{\cdpchapter}[1]{\chapter*{#1}}
% Comienza a contar las paginas de 1 otra vez:
%\setcounter{page}{1}
\setcounter{tocdepth}{2}%controlar hasta qué nivel se incluye un elemento en la tabla de materias

%\renewcommand{\mainmatter}{\cleardoublepage\pagenumbering{arabic}} %numeración de los capitulos en arabic
%\renewcommand{\frontmatter}{\cleardoublepage\pagenumbering{roman}} %numeración de los capitulos en roman



\newcommand{\hacerportada}{

 \begin{titlepage}
 \centering
  \includegraphics[scale=2.5]{img/us}	

 \begin{center}\bf\sffamily
 
  {\normalsize ESCUELA TÉCNICA SUPERIOR DE INGENIERÍA INFORMÁTICA}\\[1cm]
  {\large \@titulacion{}}\\[2.5cm]
  {\large \@titulopro{}}\\[2cm]
  {\large Realizado por}\\
  {\large \@autorUno{}}\\
  {\large \@autorDos{}}\\ %%%%%DESCOMENTAR ESTA LINEA PARA QUE APAREZCAN DOS AUTORES
  [1cm]
  {\large Dirigido por}\\
  {\large \@tutor}\\[1cm]
  {\large Departamento}\\
  {\large \@departamento}\\[3cm]
  
 
\end{center}

 \begin{flushright}
  {\bf\sffamily\large Sevilla, ({\large \@diad})}
 \end{flushright}

\end{titlepage}
}
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%


%%%%%%%%%%%%%%%%%%%%%%%%%%% REDEFINIMOS NOMBRE TABLA %%%%%%%%%%%%%%%%%%%%%%

% Redefinimos el nombre de las tablas.
% En babel está traducido por 'Cuadro' :-?
\addto\captionsspanish{\renewcommand{\tablename}{Cuadro}}
\addto\captionsspanish{\renewcommand{\listtablename}{Índice de cuadros}}

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%





% Estas definiciones son para el comando \figura
\newlength{\anchoFigura}
\newlength{\anchoFloat}
\addtolength{\fboxsep}{2\fboxsep}
%\renewcommand{\capfont}{\normalfont\normalcolor\sffamily\small}
%\renewcommand{\caplabelfont}{\normalfont\normalcolor\sffamily\bfseries\small}

% El comando \figura nos permite insertar figuras
% comodamente, y utilizando siempre el mismo formato. 
% Los parametros son:
% 1 -> Porcentaje del ancho de pagina que ocupar
	% la figura (de 0 a 1)
% 2 --> Fichero de la imagen
% 3 --> Texto a pie de imagen
% 4 --> Etiqueta (label) para referencias
% 5 --> Opciones que queramos pasarle al \includegraphics
\newcommand{\figura}[5]{
  \begin{figure}
    \begin{center}
    \includegraphics[width=#1\textwidth,#5]{#2}%
    \caption{#3}
    \label{#4}
    \end{center}
  \end{figure}
}
%COMANDO PARA INSERTAR UNA CUADRO UTILIZANDO EL FORMATO:
%1---> especificar numero de columnas y su alineacion ejm: |r||c|c| r=right, c=center,l=left
%2---> especificar el caption o titulo de la figura
%3---> label para hacer referencia a la tabla insertada
%4---> contenido de la tabla separando columnas con & y filas con \\

\newcommand{\cuadro}[4]{
		\begin{table}[htb]
			\centering
				\begin{tabular}{#1}
					\hline
						#4
					\hline
				\end{tabular}
			\caption{#2}
			\label{#3}
		\end{table}
}



%%%%%%%%%%%%%%%%%%%%%%%%%%%%%DEFINICIÓN ITEMIZE%%%%%%%%%%%%%%%%%%%%%%%%%%%%
\renewcommand{\labelitemi}{$\bullet$}%enumera con punto negro
\renewcommand{\labelitemii}{$\circ$}%enumera con círculo 
\renewcommand{\labelitemiii}{$\ast$}%enumera con asterisco
\renewcommand{\labelitemiv}{$\star$}%enumera con estrella
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

%\newcommand{\mainmatter}{%
%\cleardoublepage
%\pagestyle{CabeceraPFC}
%\newcommand{\cabeceraimpar}{\textit{\headmark}}
%\renewcommand{\cabecerapar}{\textit{PROYECTO FIN DE CARRERA}}
%\pagenumbering{arabic}

% Redefinimos el formato de \chapter
%\titleformat{\chapter}[block]{\normalfont\sffamily\huge}{\bfseries\thechapter.}{.5em}{\filleft\bfseries\MakeUppercase}%[\titlerule\vspace{2ex}]
%\titlespacing*{\chapter}{0pt}{*4}{*1}

% Redefinimos el formato de \section
\titleformat{\section}[block]{\bfseries\rmfamily\Large}{\thesection --}{.5em}{\bfseries}
\titlespacing*{\section}{0pt}{*4}{*1}

 %Redefinimos el formato de \subsection
%\titleformat{\subsection}[block]{\normalfont\rmfamily\large}{\thesubsection}{.5em}{\bfseries}
%\titlespacing*{\subsection}{0pt}{*4}{*1}

% Redefinimos el formato de \subsubsection
%\titleformat{\subsubsection}[block]{\normalfont\sffamily\normalsize}{}{0pt}{$\,\blacksquare\;\;\;$\bfseries}
%\titlespacing*{\subsubsection}{0pt}{*4}{0.5ex}



%\renewcommand{\thechapter}{\Roman{chapter}}


%%%%%%%%%%%%%%%%%%%%%%%% TITLESEC DEFINICIONES %%%%%%%%%%%%%%%%%%%%%%%%%%

\newcommand{\examplesep}{%
  \begin{center}%
    \rule{4pt}{4pt}%
  \end{center}}


\titleformat{\chapter}[display]
{\sffamily\bfseries\Large}
{\filleft\MakeUppercase{\chaptertitlename} \Huge\thechapter}
{4ex}
{\titlerule
\vspace{2ex}%
\filright}
[\vspace{2ex}%
\titlerule]





%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%



%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% DEFINICIÓN DE PART EN LETRAS PALO %%%%%%%%%
\titlecontents{part}
[3pc]
{\addvspace{1.5pc}%
\filcenter}
{%
\sffamily\huge \thecontentslabel\\*[.2pc] %
\huge}
{\sffamily\huge}
{} % That is, without page number
[\addvspace{.5pc}]
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%fin mainmatter






 %Alter page dimensions
%\setlength{\textwidth}{15.5cm} %Ancho del cuerpo
%\setlength{\oddsidemargin}{0cm} %1in + oddsidemargin = 1.54cm + 1.46 =3cm margen izquierdo
%\setlength{\evensidemargin}{2.46cm} %1in + evensidemargin = 1.54cm + 2.46 =4cm margen superior
%\setlength{\textheight}{23cm} %Alto del Cuerpo
%\setlength{\topmargin}{0cm} %Distancia entre el margen superior y el encabezamiento /headheight
%\setlength{\headsep}{1.5cm} %Distancia entre el encabezamiento y el cuerpo
%\setlength{\footnotesep}{0.6cm} %The height of a strut placed at the beginning of every footnote to produce the vertical space between footnotes


% DEFINICIONES PARA amsthm

\theoremstyle{plain}
\newtheorem{thm}{Teorema}[chapter]
\newtheorem{theorem}[thm]{Teorema}
\newtheorem{teorema}[thm]{Teorema}
\newtheorem{theoreml}[thm]{Theorem}

\newtheorem{lemma}[thm]{Lema}
\newtheorem{corollary}[thm]{Corolario}
\newtheorem{corolario}[thm]{Corolario}
\newtheorem{proposition}[thm]{Proposici{\'o}n}
\newtheorem{proposicion}[thm]{Proposici{\'o}n}
\newtheorem*{teoremasn}{Teorema}

\theoremstyle{definition}
\newtheorem{defn}{Definici{\'o}n}[chapter]
\newtheorem{definicion}[defn]{Definici{\'o}n}
\newtheorem{definition}[defn]{Definici{\'o}n}
\newtheorem{conjetura}[defn]{Conjetura}
\newtheorem{ejemplo}[defn]{Ejemplo}

\theoremstyle{remark} 
\newtheorem*{remark}{Remark}
\newtheorem*{note}{Nota} 
\newtheorem*{case}{Caso}
\newtheorem*{nota}{Nota} 
\newtheorem*{caso}{Caso}




%%%%%%%%%%%%%% para crear con \m{text}=<text> en italic %%%%
% Make active <...> produce italics surrounded by angle brackets
% (used in verbatim and \verb).
% << produces a less-than, and >> produces a greater-than.

\begingroup
  \catcode`\<=\active
  \catcode`\>=\active
  \gdef<{\@ifnextchar<\@lt\@meta}
  \gdef>{\@ifnextchar>\@gt\@gtr@err}
  \gdef\@meta#1>{\m{#1}}
  \gdef\@lt<{\char`\<}
  \gdef\@gt>{\char`\>}
\endgroup
\def\@gtr@err{%
   \ClassError{pclass}{%
      Isolated \protect>%
   }{%
      In this document class, \protect<...\protect>
      is used to indicate a parameter.\MessageBreak
      I've just found a \protect> on its own.
      Perhaps you meant to type \protect>\protect>?
   }%
}
\def\verbatim@nolig@list{\do\`\do\,\do\'\do\-}

\newcommand{\m}[1]{\mbox{$\langle$\it #1\/$\rangle$}}
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

%conseguir manualmente una página en blanco:

% \newpage{\pagestyle{empty}\cleardoublepage}