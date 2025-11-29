const fs = require('fs');
const path = require('path');

const pdfsDir = path.join(__dirname, 'pdfs');
const outputFile = path.join(__dirname, 'apuntes.json');

const categories = {
    'algoritmos': { tag: 'Algoritmos', class: 'tag-code' },
    'equipos': { tag: 'Gestión Equipos', class: 'tag-management' },
    'empresas': { tag: 'Empresas', class: 'tag-business' }
};

const notes = [];

if (!fs.existsSync(pdfsDir)) {
    console.error('Error: Directory "pdfs" not found.');
    process.exit(1);
}

// Recursive function to get all files
function getFilesRecursively(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat && stat.isDirectory()) {
            results = results.concat(getFilesRecursively(filePath));
        } else {
            results.push(filePath);
        }
    });
    return results;
}

// Iterate through categories
for (const [dirName, meta] of Object.entries(categories)) {
    const categoryPath = path.join(pdfsDir, dirName);

    if (fs.existsSync(categoryPath)) {
        const allFiles = getFilesRecursively(categoryPath);

        allFiles.forEach(filePath => {
            const lowerPath = filePath.toLowerCase();
            if (lowerPath.endsWith('.pdf') || lowerPath.endsWith('.zip') || lowerPath.endsWith('.txt')) {
                const stats = fs.statSync(filePath);
                const filename = path.basename(filePath);
                const ext = path.extname(filename);

                // Format date (Month Year)
                const date = new Date(stats.mtime);
                const month = date.toLocaleString('es-ES', { month: 'short' });
                const year = date.getFullYear();
                const formattedDate = `${month.charAt(0).toUpperCase() + month.slice(1)} ${year}`;

                // Clean filename for title
                const title = filename.replace(ext, '').replace(/[-_]/g, ' ');

                // Default Metadata
                let asignatura = '-';
                let categoryDisplay = meta.tag;
                let tagClass = meta.class;
                let type = 'Apuntes'; // Default type
                let fileUrl = path.relative(__dirname, filePath).replace(/\\/g, '/');
                let extensionDisplay = ext.replace('.', '').toUpperCase();

                // Handle .txt files as Links
                if (lowerPath.endsWith('.txt')) {
                    try {
                        // Read the first line of the file as the URL
                        const content = fs.readFileSync(filePath, 'utf-8');
                        let url = content.split('\n')[0].trim();
                        // Remove trailing dot if present (common copy-paste error)
                        if (url.endsWith('.')) {
                            url = url.slice(0, -1);
                        }

                        if (url.startsWith('http')) {
                            fileUrl = url;
                            extensionDisplay = 'LINK';
                        }
                    } catch (err) {
                        console.error(`Error reading link file ${filename}:`, err);
                    }
                }

                // Determine Type based on folder
                if (dirName === 'empresas' || dirName === 'algoritmos') {
                    type = 'Ejercicios';
                }

                // Specific Mapping Logic for 'empresas'
                if (dirName === 'empresas') {
                    if (lowerPath.includes(path.join('empresas', 'tcge'))) {
                        asignatura = 'TCGE';
                    }
                }

                // Specific Mapping Logic for 'algoritmos'
                if (dirName === 'algoritmos') {
                    if (lowerPath.includes(path.join('algoritmos', 'fal'))) {
                        asignatura = 'FAL';
                    }
                }

                // Specific Mapping Logic for 'equipos'
                if (dirName === 'equipos') {
                    // Check subfolders based on file path
                    const isInAgiles = lowerPath.includes(path.join('equipos', 'agiles'));
                    const isInTradicionales = lowerPath.includes(path.join('equipos', 'tradicionales'));

                    if (isInAgiles) {
                        categoryDisplay = 'Metodologías Ágiles';
                        asignatura = 'GPS';
                    } else if (isInTradicionales) {
                        categoryDisplay = 'Metodologías Tradicionales';

                        if (lowerPath.includes('la biblia de modelado de software')) {
                            asignatura = 'MS';
                        } else if (lowerPath.includes('la biblia de is1')) {
                            asignatura = 'IS1';
                        } else if (lowerPath.includes('la biblia de is2')) {
                            asignatura = 'IS2';
                        }
                    }
                }

                notes.push({
                    category: dirName,
                    categoryDisplay: categoryDisplay,
                    tagClass: tagClass,
                    asignatura: asignatura,
                    title: title,
                    type: type,
                    date: formattedDate,
                    file: fileUrl,
                    extension: extensionDisplay
                });
            }
        });
    }
}

// Custom Sort Order
const sortOrder = ['GPS', 'MS', 'IS2', 'IS1'];

notes.sort((a, b) => {
    const indexA = sortOrder.indexOf(a.asignatura);
    const indexB = sortOrder.indexOf(b.asignatura);

    // If both are in the list, sort by index (lower index comes first)
    if (indexA !== -1 && indexB !== -1) {
        return indexA - indexB;
    }

    // If only A is in the list, it comes first
    if (indexA !== -1) return -1;

    // If only B is in the list, it comes first
    if (indexB !== -1) return 1;

    // If neither is in the list, sort by date (newest first) or title
    return 0;
});

fs.writeFileSync(outputFile, JSON.stringify(notes, null, 2));
console.log(`Successfully generated apuntes.json with ${notes.length} notes.`);
