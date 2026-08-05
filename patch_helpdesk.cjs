const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src', 'components', 'resident', 'HelpDeskSection.tsx');
let code = fs.readFileSync(file, 'utf8');

const oldHeader = `                          <div>
                            <span className="font-mono bg-indigo-100 text-indigo-700 font-bold px-2 py-0.5 rounded text-[9px] uppercase">
                              Ticket #{item.id?.substring(0, 5) || 'COMP'}
                            </span>
                            <span className="ml-2 font-mono bg-slate-200 text-slate-700 font-bold px-2 py-0.5 rounded text-[9px] uppercase">
                              Flat {item.flatId}
                            </span>
                            {item.ownerName && (
                               <span className="ml-2 font-mono bg-indigo-50 text-indigo-700 border border-indigo-100 font-bold px-2 py-0.5 rounded text-[9px] uppercase">
                                 {item.ownerName}
                               </span>
                            )}
                            <h5 className="font-bold text-slate-800 mt-1 uppercase leading-snug">{item.title}</h5>
                          </div>`;

const newHeader = `                          <div>
                            <div className="flex flex-wrap gap-2 items-center mb-1">
                              <span className="font-mono bg-indigo-100 text-indigo-700 font-bold px-2 py-0.5 rounded text-[9px] uppercase">
                                Ticket #{item.id?.substring(0, 5) || 'COMP'}
                              </span>
                              <span className="font-mono bg-slate-200 text-slate-700 font-bold px-2 py-0.5 rounded text-[9px] uppercase">
                                Flat {item.flatId}
                              </span>
                            </div>
                            <h5 className="font-bold text-slate-800 uppercase leading-snug">{item.title}</h5>
                            {item.ownerName && (
                               <p className="text-[10px] text-slate-500 font-medium mt-0.5">Raised by: <span className="font-bold text-slate-700">{item.ownerName}</span></p>
                            )}
                          </div>`;

code = code.replace(oldHeader, newHeader);

// add processNotes
const oldAttachmentsEnd = `                                </ChunkedMedia>
                              )}
                            </div>
                          </div>
                        )}
                      </div>`;

const newAttachmentsEnd = `                                </ChunkedMedia>
                              )}
                            </div>
                          </div>
                        )}
                        {item.processNotes && (
                          <div className="bg-slate-100/50 border border-slate-200 rounded-xl p-3 text-[10px] text-slate-600 leading-normal mt-3">
                            <p className="font-bold text-slate-500 uppercase text-[9px] tracking-wider mb-1">Secretary Review & Actions Done:</p>
                            <p className="font-medium whitespace-pre-line text-slate-700 text-xs">{item.processNotes}</p>
                          </div>
                        )}
                      </div>`;

code = code.replace(oldAttachmentsEnd, newAttachmentsEnd);

fs.writeFileSync(file, code);
