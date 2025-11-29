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
            if (filePath.toLowerCase().endsWith('.pdf')) {
                const stats = fs.statSync(filePath);
                const filename = path.basename(filePath);

                // Format date (Month Year)
                const date = new Date(stats.mtime);
                const month = date.toLocaleString('es-ES', { month: 'short' });
                const year = date.getFullYear();
                const formattedDate = `${month.charAt(0).toUpperCase() + month.slice(1)} ${year}`;

                // Clean filename for title
                const title = filename.replace('.pdf', '').replace(/[-_]/g, ' ');

                // Default Metadata
                let asignatura = '-';
                let categoryDisplay = meta.tag;
                let tagClass = meta.class;

                // Specific Mapping Logic for 'equipos'
                if (dirName === 'equipos') {
                    const lowerName = filename.toLowerCase();

                    if (lowerName.includes('versiculos de un sm')) {
                        asignatura = 'GPS';
                        categoryDisplay = 'Metodologías Ágiles';
                    } else if (lowerName.includes('la biblia de ms')) {
                        asignatura = 'MS';
                        categoryDisplay = 'Metodologías Tradicionales';
                    } else if (lowerName.includes('la biblia de is1')) {
                        asignatura = 'IS1';
                        categoryDisplay = 'Metodologías Tradicionales';
                    } else if (lowerName.includes('la biblia de is2')) {
                        asignatura = 'IS2';
                        categoryDisplay = 'Metodologías Tradicionales';
                    }
                }

                // Relative path for web
                const relativePath = path.relative(__dirname, filePath).replace(/\\/g, '/');

                notes.push({
                    category: dirName,
                    categoryDisplay: categoryDisplay,
                    tagClass: tagClass,
                    asignatura: asignatura,
                    title: title,
                    date: formattedDate,
                    file: relativePath
                });
            }
        });
    }
}

// Sort by date (newest first)
notes.sort((a, b) => 0);

fs.writeFileSync(outputFile, JSON.stringify(notes, null, 2));
console.log(`Successfully generated apuntes.json with ${notes.length} notes.`);
